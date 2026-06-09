export const Worklets = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runOnJS: <T extends (...args: any[]) => any>(fn: T): T => fn,
};
