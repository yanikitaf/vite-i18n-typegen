import { promises as fs } from 'fs';

export const readTranslationFile = async (
  filePath: string,
  lang: string,
): Promise<{ key: string; translations: Record<string, string> }[]> => {
  const content = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);

  const flatten = (
    obj: object,
    prefix = '',
    result: { key: string; value: string }[] = [],
  ) => {
    Object.entries(obj).forEach(([k, v]) => {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') {
        result.push({ key, value: v });
      } else if (typeof v === 'object' && v !== null) {
        flatten(v, key, result);
      }
    });
    return result;
  };

  return flatten(data).map(({ key, value }) => ({
    key,
    translations: { [lang]: value },
  }));
};
