export function getKeys<T>(obj: T): { [K in keyof T]: K } {
  return Object.keys(obj as any).reduce(
    (acc, key) => {
      acc[key as keyof T] = key as keyof T;
      return acc;
    },
    {} as { [K in keyof T]: K }
  );
}
