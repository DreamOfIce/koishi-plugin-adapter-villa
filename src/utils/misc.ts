export const exclude = <T extends object, U extends string[]>(
  obj: T,
  keys: U,
) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key)),
  ) as Exclude<T, U[number]>;

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
