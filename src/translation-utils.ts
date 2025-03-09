export type TranslationItem<
  Keys extends string,
  ParamsMap extends Record<Keys, any>
> = Keys extends any
  ? undefined extends ParamsMap[Keys]
    ? [Keys] | [Keys, ParamsMap[Keys]]
    : [Keys, ParamsMap[Keys]?]
  : never;

export type TranslateFunction<
  Keys extends string,
  ParamsMap extends Record<Keys, any>
> = {
  <K extends Keys>(...args: TranslationItem<K, ParamsMap>): string;
};
