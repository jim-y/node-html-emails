interface BlockOptions {
  pattern: string;
  ignore: string;
}

export interface Options {
  root: string;
  layouts: BlockOptions;
  partials: BlockOptions;
}