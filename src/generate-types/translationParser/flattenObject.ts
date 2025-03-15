export const flattenObject = (
  obj: Record<string, any>,
  prefix = '',
): Record<string, string[]> => {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const nestedKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        // @ts-ignore
        acc[nestedKey] = [...value.matchAll(/\{(\w+)\}/g)].map(
          ([, param]) => param,
        );
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(acc, flattenObject(value, nestedKey));
      }
      return acc;
    },
    {} as Record<string, string[]>,
  );
};
