'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Handlebars = require("handlebars");
const i18n = require("i18n");
const juice = require("juice");
const glob = require("glob");
const path = require("path");
const fs = require("fs");
const debug = require("debug");
debug('node-html-emails');
class NodeHtmlEmails {
    constructor(config, options) {
        this.config = config;
        this.options = options;
        this.layouts = {};
        this.partials = {};
        this.coreCss = fs.readFileSync(path.join(__dirname, './core.css'));
        this.registerHelpers();
        this.loadLayouts();
        this.loadPartials();
    }
    generate(type, options) {
        const descriptor = this.config[type];
        let params;
        let layout;
        let partials = {};
        let css;
        let content;
        if (options != null) {
            params = Object.assign({}, options, descriptor.i18n);
        }
        else {
            params = descriptor.i18n;
        }
        if (descriptor.content == null) {
            throw new Error('Content must be defined. Content should identify a partial, or come as a string');
        }
        if (descriptor.partials != null) {
            Object
                .keys(descriptor.partials)
                .forEach(identifier => {
                const partialName = descriptor.partials[identifier];
                const _partial = this.partials[partialName];
                if (_partial != null) {
                    partials[identifier] = _partial;
                }
                else {
                    partials[identifier] = partialName;
                }
            });
        }
        if (this.partials[descriptor.content] == null) {
            content = descriptor.content;
        }
        else {
            content = this.partials[descriptor.content];
        }
        partials.content = content;
        Handlebars.registerPartial(partials);
        if (descriptor.layout != null) {
            if (this.layouts[descriptor.layout] != null) {
                layout = this.layouts[descriptor.layout];
            }
            else {
                layout = Handlebars.compile(descriptor.layout);
            }
        }
        else {
        }
        let result = layout(params);
        Object
            .keys(partials)
            .forEach(key => {
            if (Object.keys(this.partials).includes(key)) {
                Handlebars.registerPartial(key, this.partials[key]);
            }
            else {
                Handlebars.unregisterPartial(key);
            }
        });
        if (descriptor.css != null) {
            css = Buffer.concat([this.coreCss, descriptor.css]);
        }
        else {
            css = this.coreCss;
        }
        return juice(result, { extraCss: css });
    }
    loadLayouts() {
        this.load(this.layouts, this.options.layouts);
        Object.keys(this.layouts).forEach(tplKey => {
            this.layouts[tplKey] = Handlebars.compile(this.layouts[tplKey]);
        });
        debug(`Email layouts: ${Object.keys(this.layouts).join(', ')}`);
    }
    loadPartials() {
        this.load(this.partials, this.options.partials);
        Object.keys(this.partials).forEach(prtlKey => {
            Handlebars.registerPartial(prtlKey, this.partials[prtlKey]);
        });
        debug(`Email partials: ${Object.keys(this.partials).join(', ')}`);
    }
    load(cache, options) {
        const globOptions = {};
        if (options.ignore) {
            globOptions.ignore = options.ignore;
        }
        const files = glob.sync(`${this.options.root}/**/${options.pattern}`, globOptions);
        files.forEach(this.getFillCacheCb(cache));
    }
    getFillCacheCb(cache) {
        return (filePath) => {
            const { base } = path.parse(filePath);
            const identifier = base.split('.')[0];
            cache[identifier] = fs.readFileSync(filePath).toString();
        };
    }
    registerHelpers() {
        Handlebars.registerHelper('translate', (str, ...arg) => {
            arg = Array.from(arg).map(a => Handlebars.Utils.escapeExpression(a));
            return new Handlebars.SafeString(i18n.__(str, ...arg));
        });
    }
}
exports.default = NodeHtmlEmails;
//# sourceMappingURL=node-html-emails.js.map