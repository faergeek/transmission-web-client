type SnakeCaseToCamelCase<T extends string> =
  T extends `${infer Head}-${infer Tail}`
    ? `${Head}${SnakeCaseToCamelCase<Capitalize<Tail>>}`
    : T;

export function snakeCaseToCamelCase<T extends string>(input: T) {
  return input.replace(
    /-(\w)(\w+)/g,
    (_, first, rest) => first.toUpperCase() + rest,
  ) as SnakeCaseToCamelCase<T>;
}

export type ConvertSnakeCaseKeysToCamelCase<T> = T extends [
  infer Head,
  ...infer Tail,
]
  ? Tail extends []
    ? [Head]
    : [
        ConvertSnakeCaseKeysToCamelCase<Head>,
        ...ConvertSnakeCaseKeysToCamelCase<Tail>,
      ]
  : T extends Array<infer U>
    ? Array<ConvertSnakeCaseKeysToCamelCase<U>>
    : T extends Record<string, unknown>
      ? {
          [K in string &
            keyof T as SnakeCaseToCamelCase<K>]: ConvertSnakeCaseKeysToCamelCase<
            T[K]
          >;
        }
      : T;

export function convertSnakeCaseKeysToCamelCase<T>(
  input: T,
): ConvertSnakeCaseKeysToCamelCase<T> {
  return (
    Array.isArray(input)
      ? input.map(convertSnakeCaseKeysToCamelCase)
      : input && typeof input === 'object'
        ? Object.fromEntries(
            Object.entries(input).map(([key, value]) => [
              snakeCaseToCamelCase(key),
              convertSnakeCaseKeysToCamelCase(value),
            ]),
          )
        : input
  ) as ConvertSnakeCaseKeysToCamelCase<T>;
}
