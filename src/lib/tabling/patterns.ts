import { filter, isNil, map, findLastIndex, reduce } from "lodash";
import * as typeguards from "./typeguards";
import * as aggrid from "./aggrid";

const SEPARATORS = ["-", " ", "  "];

type SeparatorAndIndex = {
  readonly separator: string;
  readonly index: number;
};

const findLastSeparator = (value: string): SeparatorAndIndex | null => {
  const indices: number[] = filter(
    map(SEPARATORS, (sep: string) => findLastIndex(value, (c: string) => c.toLowerCase() === sep.toLocaleLowerCase())),
    (i: number) => i !== -1
  );
  if (indices.length !== 0) {
    return {
      separator: value[Math.max(...indices)],
      index: Math.max(...indices)
    };
  }
  return null;
};

const separate = (value: string): [string, string, string] | null => {
  const separatorAndIndex = findLastSeparator(value);
  if (!isNil(separatorAndIndex)) {
    const prefix = value.slice(0, separatorAndIndex.index);
    const suffix = value.slice(separatorAndIndex.index + 1);
    return [prefix, separatorAndIndex.separator, suffix];
  }
  return null;
};

const toNumber = (value: PatternValue): number | null => {
  if (value === null) {
    return null;
  } else if (typeof value === "number") {
    return value;
  } else if (!isNaN(parseInt(value))) {
    return parseInt(value);
  }
  return null;
};

type PatternValue = string | number | null;

const isPatternValue = (value: any): value is PatternValue =>
  value === null || typeof value === "string" || typeof value === "number";

/**
 * A function that intelligently tries to infer what the next value should be in
 * a table cell based on the previous value and the previous previous value.
 */
export const detectNextInPattern = (
  values: Table.PreviousValues<PatternValue>,
  equalInfers?: boolean
): PatternValue => {
  let previousValue: PatternValue = null;
  let value: PatternValue = null;
  if (Array.isArray(values)) {
    if (values.length !== 1) {
      previousValue = values[0];
      value = values[1];
    } else {
      value = values[0];
    }
  } else {
    value = values;
  }

  const numericValue = toNumber(value);
  if (!isNil(numericValue)) {
    const previousNumericValue = toNumber(previousValue);
    if (!isNil(previousNumericValue)) {
      if (previousNumericValue < numericValue) {
        const diff = numericValue - previousNumericValue;
        return typeof value === "string" ? String(numericValue + diff) : numericValue + diff;
      } else if (numericValue < previousNumericValue) {
        const diff = previousNumericValue - numericValue;
        return typeof value === "string" ? String(numericValue - diff) : numericValue - diff;
      } else {
        // The numeric values are the same, but if we are not considering an
        // equality part of a pattern then we should return null to indicate that
        // we could not infer a pattern.
        return equalInfers ? value : null;
      }
    } else {
      return typeof value === "string" ? String(numericValue + 1) : numericValue + 1;
    }
  } else if (typeof value === "string") {
    // If the value itself is not numeric, then maybe there is a prefix before
    // a numeric value that we can infer from.
    const separated = separate(value);
    if (!isNil(separated)) {
      if (!isNil(previousValue) && typeof previousValue === "string") {
        if (previousValue === value && equalInfers) {
          return value;
        }
        const previousSeparated = separate(previousValue);
        if (!isNil(previousSeparated) && previousSeparated[1] === separated[1]) {
          const nextInPattern = detectNextInPattern([previousSeparated[2], separated[2]], equalInfers);
          if (!isNil(nextInPattern)) {
            return separated[0] + separated[1] + nextInPattern;
          }
        }
      }
    }
  }
  return null;
};

export const findPreviousModelRows = <R extends Table.RowData>(
  api: Table.GridApi,
  newIndex: number
): Table.PreviousValues<Table.ModelRow<R>> | null => {
  if (newIndex === 0) {
    return null;
  }
  let runningIndex = newIndex;
  let modelRows: Table.ModelRow<R>[] = [];

  while (runningIndex > 0) {
    runningIndex = runningIndex - 1;
    const node = api.getDisplayedRowAtIndex(runningIndex);
    if (!isNil(node)) {
      const row: Table.BodyRow<R> = node.data;
      if (typeguards.isModelRow(row)) {
        modelRows.push(row);
        if (modelRows.length === 2) {
          break;
        }
      }
    } else {
      break;
    }
  }
  if (modelRows.length === 0) {
    return null;
  }
  modelRows.reverse();
  return modelRows as Table.PreviousValues<Table.ModelRow<R>>;
};

const mapPreviousValues = <T, R>(values: Table.PreviousValues<T>, fn: (v: T) => R): Table.PreviousValues<R> => {
  return values.length === 1 ? [fn(values[0])] : [fn(values[0]), fn(values[1])];
};

/* eslint-disable indent */
export const generateNewRowData = <R extends Table.RowData, M extends Model.RowHttpModel>(
  api: Table.GridApi,
  columns: Table.Column<R, M>[],
  newIndex?: number
): Partial<R> =>
  reduce(
    columns,
    (curr: Partial<R>, c: Table.Column<R, M>) => {
      const field = c.field;
      if (c.isRead !== false && !isNil(field)) {
        if (c.smartInference === true) {
          const newRowIndex = newIndex === undefined ? aggrid.getRows(api).length : newIndex;
          const previousRows = findPreviousModelRows<R>(api, newRowIndex);
          if (!isNil(previousRows)) {
            const previousValues = mapPreviousValues<Table.ModelRow<R>, R[keyof R]>(
              previousRows,
              (r: Table.ModelRow<R>) => r.data[field]
            );
            const patternValues: PatternValue[] = [];
            for (let i = 0; i < previousValues.length; i++) {
              const v = previousValues[i];
              if (isPatternValue(v)) {
                patternValues.push(v);
              } else {
                console.warn(
                  `Smart inference is being used on column ${field} that has a
                data type (${typeof v}) that does not support smart inference.`
                );
              }
            }
            if (patternValues.length === previousValues.length) {
              const inferred = detectNextInPattern(patternValues as Table.PreviousValues<PatternValue>, false);
              if (!isNil(inferred)) {
                return { ...curr, [field]: inferred };
              }
            }
          }
        } else if (c.defaultNewRowValue !== undefined) {
          return { ...curr, [field]: c.defaultNewRowValue };
        }
      }
      return curr;
    },
    {}
  );
