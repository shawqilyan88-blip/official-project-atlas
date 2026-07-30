/**
 * Roving-tabindex keyboard math, shared by every widget that owns a single
 * "active" item within a group — the opportunity tablist and the objective
 * radiogroups. Given an arrow / Home / End key, it returns the index focus
 * should move to, wrapping at both ends. It returns -1 for any other key so the
 * caller can ignore the event and let it through untouched.
 *
 * Orientation is configurable because the ARIA patterns differ: a horizontal
 * tablist reserves Up/Down, while a radiogroup laid out as a grid should answer
 * to all four arrows.
 */
export function rovingIndex(
  key: string,
  current: number,
  count: number,
  options: { horizontal?: boolean; vertical?: boolean } = {},
): number {
  if (count <= 0) return -1;
  const { horizontal = true, vertical = true } = options;
  const wrap = (n: number) => (n + count) % count;

  switch (key) {
    case 'ArrowRight':
      return horizontal ? wrap(current + 1) : -1;
    case 'ArrowLeft':
      return horizontal ? wrap(current - 1) : -1;
    case 'ArrowDown':
      return vertical ? wrap(current + 1) : -1;
    case 'ArrowUp':
      return vertical ? wrap(current - 1) : -1;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return -1;
  }
}
