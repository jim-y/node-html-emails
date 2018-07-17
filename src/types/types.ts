interface BlockOptions {
  pattern?: string;
  ignore?: string;
}

interface i18nOptions {
  directory: string;
  locales: string[];
}

export interface Options {
  root?: string;
  locales?: i18nOptions;
  layouts?: BlockOptions;
  partials?: BlockOptions;
  browserLink?: boolean;
}