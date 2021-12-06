import { filter, isNil, map, findLastIndex, reduce } from "lodash";
import { FillOperationParams } from "@ag-grid-community/core/dist/cjs/entities/gridOptions";

import * as columnFns from "./columns";
import * as typeguards from "./typeguards";
import * as aggrid from "./aggrid";

const SEPARATORS = ["-", " ", "  "];

type SeparatorAndIndex = {
  readonly separator: string;
  readonly index: number;
};

type PatternValue = string | number | null;

const isPatternValue = (value: any): value is PatternValue =>
  value === null || typeof value === "string" || typeof value === "number";

/**
 * A function that intelligently tries to infer what the next value should be in
 * a table cell based on the previous value and the previous previous value
 * if one or either exist.
 *
 * The function is intelligent enough to recognize that when there is a "Separator"
 * in the value, if the prefixes before the "Separator" are consistent, the value
 * can be inferred based on the partial value after the "Separator".
 *
 * For instance, if we have values ["Account 100", "Account 200"], the "Separator"
 * is " " - the function will recognize that the prefix "Account" is the same
 * for each value and thus the inference can be made based on ["100", "200"].
 *
 * Usage:
 * -----
 * When attempting to detect the next value in a pattern, we either provide
 * an array of length-1 in the case that there is only one previous value, or
 * an array of length-2 in the case that there are 2 or more previous values.
 *
 * Note that we do not provide more than 2 previous values as only 2 are needed
 * for the inferences we are making here.
 *
 * detectNextInPattern(["100"])
 * >>> "101"
 *
 * detectNextInPattern(["100", "102"])
 * >>> "104"
 *
 * detectNextInPattern(["account-100", "account-102"])
 * >>> "account-104"
 */
export const detectNextInPattern = (values: Table.PreviousValues<PatternValue>): PatternValue => {
  const findLastSeparator = (value: string): SeparatorAndIndex | null => {
    const indices: number[] = filter(
      map(SEPARATORS, (sep: string) =>
        findLastIndex(value, (c: string) => c.toLowerCase() === sep.toLocaleLowerCase())
      ),
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
        return null;
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
        if (previousValue === value) {
          return null;
        }
        const previousSeparated = separate(previousValue);
        if (!isNil(previousSeparated) && previousSeparated[1] === separated[1]) {
          const nextInPattern = detectNextInPattern([previousSeparated[2], separated[2]]);
          if (!isNil(nextInPattern)) {
            return separated[0] + separated[1] + nextInPattern;
          }
        }
      }
    }
  }
  return null;
};

/*
Information required to detect patterns when in the context of AGGrid.  When
using AGSource, the rows will be pulled directly from the GridApi.

Note that if using an AGGrid source, the rows are pulled from the AGGrid table itself,
not the store.  In the case that the rows are pulled from the AGGrid table,
we cannot generate data for multiple rows because after the first generated
RowData, generating each subsequent RowData object requires the previously
created RowNode in AGGrid (because it needs them to detect a pattern) - and
these RowNode(s) will not exist until after this function returns.
*/
type AGSource = { readonly api: Table.GridApi; readonly newIndex?: number };

/*
Information required to detect patterns in the context of the reducers.  When
in a reducer, the rows will be pulled directly from the store.

Note that the elements of the array can be both BodyRow<R> (the rows in the
store) or Partial<R>.  This is because when creating multiple rows, or creating
rows very quickly, the full row may not have been created yet at the time of
usage - only the data being used to create the row via the API.
*/
type ReduxSource<R extends Table.RowData> = {
  readonly store: (Table.BodyRow<R> | Partial<R>)[];
  readonly newIndex?: number;
  readonly count?: number;
};

/*
The pattern detection logic needs to be able to work both inside the context
of AGGrid or outside of the context of AGGrid, in the reducers.
*/
type Source<R extends Table.RowData> = AGSource | ReduxSource<R>;

const isAgSource = <R extends Table.RowData>(source: Source<R> | Omit<ReduxSource<R>, "count">): source is AGSource =>
  (source as AGSource).api !== undefined;

const isReduxSource = <R extends Table.RowData>(
  source: Source<R>
): source is ReduxSource<R> | Omit<ReduxSource<R>, "count"> => (source as ReduxSource<R>).store !== undefined;

const getSourceIndex = <R extends Table.RowData>(source: AGSource | Omit<ReduxSource<R>, "count">): number => {
  const numRows = isAgSource(source) ? aggrid.getRows(source.api).length : source.store.length;
  if (!isNil(source.newIndex)) {
    if (source.newIndex > numRows) {
      console.warn(
        `New index ${source.newIndex} exceeds the number of rows (${numRows}).
        Defaulting to the end of the table/store at ${numRows}.`
      );
      return numRows;
    }
    return source.newIndex;
  }
  return numRows;
};

/**
 * Given the provided source information, determines what the previous ModelRow
 * is or prevous 2 ModelRow(s) are in the case that there are 2 ModelRow(s) before
 * the row at the designated index.  If there are no ModelRow(s) before the
 * designated index, returns null.
 *
 * @param source  The information required to determine the table rows, either
 *                from the store directly or from AGGrid's GridApi.
 * @returns       The previous 1 or 2 ModelRow(s) before the designated index, or
 *                null if there are no ModelRow(s) before the index.
 */
export const findPreviousModelRows = <R extends Table.RowData>(
  source: AGSource | Omit<ReduxSource<R>, "count">,
  filling?: boolean
): Table.PreviousValues<Table.ModelRow<R> | Partial<R> | Table.PlaceholderRow<R>> | null => {
  // If finding the previous ModelRow<R>(s) from AG Grid, we can specify the index
  // we are starting at, otherwise we start at the end of the table (in AG Grid
  // context) or the end ot the store (in Reducer context).
  let runningIndex = getSourceIndex(source);

  const isModelRowOrData = (
    r: Table.BodyRow<R> | Partial<R>
  ): r is Table.ModelRow<R> | Table.PlaceholderRow<R> | Partial<R> =>
    typeguards.isRow(r) ? typeguards.isModelRow(r) || typeguards.isPlaceholderRow(r) : true;

  if (
    runningIndex === 0 ||
    (isReduxSource(source) &&
      filter(source.store, (r: Table.BodyRow<R> | Partial<R>) => isModelRowOrData(r)).length === 0)
  ) {
    return null;
  }

  const getRowAtIndex = (index: number): Table.BodyRow<R> | Partial<R> | null => {
    if (isAgSource(source)) {
      // The node should exist at the index because we check the validity of the
      // index compared to the number of rows in the table in `getSourceIndex` -
      // but this is mostly to make TS happy and to protect against edge cases.
      const node = source.api.getDisplayedRowAtIndex(index);
      if (!isNil(node)) {
        const row: Table.BodyRow<R> = node.data;
        return row;
      }
      return null;
    } else {
      // The index should be in the store because we check the validity of the
      // index compared to the length of the store in `getSourceIndex` - so this
      // is primarily to make TS happy.
      return source.store[index] || null;
    }
  };

  let modelRowsOrData: (Table.ModelRow<R> | Table.PlaceholderRow<R> | Partial<R>)[] = [];

  // Because of how the timing of when the values are actually placed inside of
  // the AGGrid table, when we are filling cells from a drag handle, we need to
  // start one less than the index because the value is already assumed to be
  // in the table.
  if (filling) {
    runningIndex = runningIndex - 1;
  }

  let row: Table.BodyRow<R> | Partial<R> | null = getRowAtIndex(runningIndex);
  while (runningIndex > 0 && !isNil(row)) {
    if (isModelRowOrData(row)) {
      modelRowsOrData.push(row);
      if (modelRowsOrData.length === 2) {
        break;
      }
    }
    runningIndex = runningIndex - 1;
    row = getRowAtIndex(runningIndex);
  }
  if (modelRowsOrData.length === 0) {
    return null;
  }
  modelRowsOrData.reverse();
  return modelRowsOrData as Table.PreviousValues<Table.ModelRow<R> | Table.PlaceholderRow<R> | Partial<R>>;
};

const mapPreviousValues = <T, R>(values: Table.PreviousValues<T>, fn: (v: T) => R): Table.PreviousValues<R> => {
  return values.length === 1 ? [fn(values[0])] : [fn(values[0]), fn(values[1])];
};

const detectPatternFromPreviousRows = <R extends Table.RowData>(
  /*
  We have to allow the previousRows to include both ModelRow(s) and partially
  created RowData because in the sagas, the full rows will not have been created
  yet, only the data that is used to create the new rows via the API.
  */
  previousRows: Table.PreviousValues<Table.ModelRow<R> | Partial<R> | Table.PlaceholderRow<R>>,
  field: keyof R
): PatternValue | null => {
  let columnSupportsSmartInference = true;

  const previousValues = mapPreviousValues<
    Table.ModelRow<R> | Partial<R> | Table.PlaceholderRow<R>,
    R[keyof R] | undefined
  >(previousRows, (ri: Table.ModelRow<R> | Partial<R> | Table.PlaceholderRow<R>) => {
    /*
      If the object is a Row, then we know the value will not be undefined
      because we do not allow undefined values for Row(s).  In the worst case
      scenario, if it happened to slip in and avoid TS type checks, the below
      block of code would recognize that `undefined` is not a PatternValue and
      previous smart inference based on this column.
      */
    if (typeguards.isRow(ri)) {
      return ri.data[field];
    } else {
      /*
        If the object is not a Row, and is a partially created RowData object,
        then the value will be undefined if the field does not exist in the
        Partial - which can happen if there is an inconsistency with generating
        row data from one row to the next.

        In this case, we cannot perform the smart inference, so we simply return
        `undefined` so that the next block of code will recognize the `undefined`
        value as not being a PatternValue and not perform the inference.
        */
      return ri[field];
    }
  });
  const patternValues: PatternValue[] = [];
  for (let i = 0; i < previousValues.length; i++) {
    const v = previousValues[i];
    if (isPatternValue(v)) {
      patternValues.push(v);
    } else {
      columnSupportsSmartInference = false;
      if (v === undefined) {
        console.warn(
          `Cannot perform smart inference as an undefined value was detected
          for column ${field}.  This most likely means there is an inconstency
          with how the new row data is being generated between any two given rows.`
        );
      } else {
        console.warn(
          `Smart inference is being used on column ${field} that has a
          data type (${typeof v}) that does not support smart inference.`
        );
      }
      break;
    }
  }
  if (columnSupportsSmartInference) {
    return detectNextInPattern(patternValues as Table.PreviousValues<PatternValue>);
  }
  return null;
};

export const inferFillCellValue = <R extends Table.RowData, M extends Model.RowHttpModel>(
  params: FillOperationParams,
  columns: Table.Column<R, M>[]
): any => {
  if (params.direction === "down") {
    const c: Table.Column<R, M> | null = columnFns.getColumn(columns, params.column.getColId());
    // The column will be by default not-fake and readable (`isRead !== false`) since it is
    // already in the table.
    if (!isNil(c) && c.smartInference === true && !isNil(params.rowNode.rowIndex)) {
      const previousRows = findPreviousModelRows<R>({ api: params.api, newIndex: params.rowNode.rowIndex }, true);
      if (!isNil(previousRows)) {
        return detectPatternFromPreviousRows(previousRows, params.column.getColId() as keyof R);
      }
    }
  }
  return null;
};

/* eslint-disable indent */
export const generateNewRowData = <R extends Table.RowData, M extends Model.RowHttpModel>(
  source: Source<R>,
  columns: Table.Column<R, M>[]
  /* eslint-disable indent */
): Partial<R>[] => {
  if (isReduxSource(source) && source.count !== undefined && source.count !== 1) {
    if (source.count === 0) {
      return [];
    } else {
      // We need to keep track of the RowData objects that are created as we go,
      // because in the case we are generating multiple RowData objects, the previously
      // created RowData object needs to factor into the pattern recognition.
      let runningRows: Partial<R>[] = [];
      for (let i = 0; i < source.count; i++) {
        let runningSource = { ...source, count: 1, store: [...source.store, ...runningRows] };
        const newRowData = generateNewRowData(runningSource, columns);
        runningRows.push(newRowData[0]);
      }
      return runningRows;
    }
  } else {
    return [
      reduce(
        columns,
        (curr: Partial<R>, c: Table.Column<R, M>) => {
          const field = c.field;
          if (c.isRead !== false && !isNil(field)) {
            if (c.smartInference === true) {
              if (isAgSource(source) && isNil(source.newIndex)) {
                source = { ...source, newIndex: aggrid.getRows(source.api).length };
              }
              const previousRows = findPreviousModelRows<R>(source);
              if (!isNil(previousRows)) {
                const inferred = detectPatternFromPreviousRows(previousRows, field);
                if (!isNil(inferred)) {
                  return { ...curr, [field]: inferred };
                }
              }
            } else if (c.defaultNewRowValue !== undefined) {
              return { ...curr, [field]: c.defaultNewRowValue };
            }
          }
          return curr;
        },
        {}
      )
    ];
  }
};
