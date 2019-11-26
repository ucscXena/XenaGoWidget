
export function logError(err) {
  // eslint-disable-next-line no-console
  console.log(err.stack);
  return err;
}
