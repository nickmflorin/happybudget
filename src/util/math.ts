export const generateRandomNumericId = (): number => {
  return parseInt(Math.random().toString().slice(2, 11));
};
