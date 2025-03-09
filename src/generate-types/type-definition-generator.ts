export function generateTypeDefinitions(
  keyParamsMap: Record<string, string[]>
): string {
  console.log("Генерация TypeScript определений...");
  const translationKeys = Object.keys(keyParamsMap)
    .map((key) => `  | "${key}"`)
    .join("\n");
  const paramsMap = Object.entries(keyParamsMap)
    .map(
      ([key, params]) =>
        `  "${key}": ${
          params.length > 0
            ? `{ ${params.map((p) => `${p}: string`).join("; ")} }`
            : "undefined"
        };`
    )
    .join("\n");
  return `export type TranslationKeys =\n${translationKeys};\n\nexport type TranslationParamsMap = {\n${paramsMap}\n};\n`;
}
