type Range<T extends number> = number extends T ? number : _Range<T, []>;

type _Range<T extends number, R extends unknown[]> = R['length'] extends T
  ? R['length']
  : R['length'] | _Range<T, [T, ...R]>;

export { type Range };
