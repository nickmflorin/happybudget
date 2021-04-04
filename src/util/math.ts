import { reduce } from "lodash";

export const generateRandomNumericId = (): number => {
  return parseInt(Math.random().toString().slice(2, 11));
};

export const sumArray = (values: number[]): number => {
  return reduce(values, (sum: number, val: number) => sum + val, 0);
};
