'use strict';

import * as Handlebars from 'handlebars';
import * as i18n from 'i18n';
import * as juice from 'juice';
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import * as debug from 'debug';

import * as nhe from './types/types';

debug('node-html-emails');

export default class NodeHtmlEmails {

  private layouts = {};
  private partials = {};
  private coreCss = fs.readFileSync(path.join(__dirname, './core.css'));

  constructor(
    private config: any,
    private options: nhe.Options
  ) {
    this.registerHelpers();
    this.loadLayouts();
    this.loadPartials();
  }

  generate(type, options) {
    const descriptor = this.config[type];

    let params;
    let layout;
    let partials: any = {};
    let css;
    let content;

    if (options != null) {
        params = Object.assign({}, options, descriptor.i18n);
    } else {
        params = descriptor.i18n;
    }

    if (descriptor.content == null) {
        throw new Error('Content must be defined. Content should identify a partial, or come as a string');
    }

    if (descriptor.partials != null) {
        Object
            .keys(descriptor.partials)
            .forEach(identifier => {
                // E.g
                // partials: { header: 'header_ovveride' }
                // then identifier = header and partialName = "header_override"
                // in this case there must/might be a header_override.partial.hbs file somewhere
                const partialName = descriptor.partials[identifier];
                const _partial = this.partials[partialName];

                if (_partial != null) {
                    // partial-override
                    partials[identifier] = _partial;
                } else {
                    // one-off partial. In this case partialName is not a partial identifier instead it's a hbs
                    // partial string
                    partials[identifier] = partialName;
                }
            });
    }

    if (this.partials[descriptor.content] == null) {
        content = descriptor.content;
    } else {
        content = this.partials[descriptor.content];
    }

    partials.content = content;

    // Registering one-off partials and partial-overrides
    Handlebars.registerPartial(partials);

    if (descriptor.layout != null) {
        if (this.layouts[descriptor.layout] != null) {
            layout = this.layouts[descriptor.layout];
        } else {
            layout = Handlebars.compile(descriptor.layout);
        }
    } else {
        // Fallback case
        // TODO get default
    }

    let result = layout(params);

    // Restoring default partials
    Object
        .keys(partials)
        .forEach(key => {
            if (Object.keys(this.partials).includes(key)) {
                // We need to restore the original partial
                Handlebars.registerPartial(key, this.partials[key]);
            } else {
                // It was a one-off partial
                Handlebars.unregisterPartial(key);
            }
        });

    if (descriptor.css != null) {
        css = Buffer.concat([this.coreCss, descriptor.css]);
    } else {
        css = this.coreCss;
    }

    return juice(result, { extraCss: css });
  }

  private loadLayouts() {
    this.load(this.layouts, this.options.layouts);

    Object.keys(this.layouts).forEach(tplKey => {
      this.layouts[tplKey] = Handlebars.compile(this.layouts[tplKey]);
    });

    debug(`Email layouts: ${Object.keys(this.layouts).join(', ')}`);
  }

  private loadPartials() {
    this.load(this.partials, this.options.partials);

    Object.keys(this.partials).forEach(prtlKey => {
      Handlebars.registerPartial(prtlKey, this.partials[prtlKey]);
    });

    debug(`Email partials: ${Object.keys(this.partials).join(', ')}`);
  }

  private load(cache, options) {
    const globOptions: any = {};
    if (options.ignore) { globOptions.ignore = options.ignore; }
    const files = glob.sync(`${this.options.root}/**/${options.pattern}`, globOptions);
    files.forEach(this.getFillCacheCb(cache));
  }

  private getFillCacheCb(cache) {
    return (filePath) => {
      const { base } = path.parse(filePath);
      const identifier = base.split('.')[0]; // action.layout.hbs -> action
      cache[identifier] = fs.readFileSync(filePath).toString();
    };
  }

  private registerHelpers() {
    // Registering the "translate" helper
    Handlebars.registerHelper('translate', (str, ...arg) => {
      arg = Array.from(arg).map(a => Handlebars.Utils.escapeExpression(a));
      return new Handlebars.SafeString(i18n.__(str, ...arg));
    });
  }

}