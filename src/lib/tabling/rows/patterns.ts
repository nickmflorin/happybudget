import { FillOperationParams } from "ag-grid-community";
import { findLastIndex } from "lodash";

import { logger } from "internal";

import * as model from "../../model";
import * as aggrid from "../aggrid";
import * as columns from "../columns";
import { CellValue, PreviousValues, GridApi } from "../types";

import * as typeguards from "./typeguards";
import * as types from "./types";

const SEPARATORS = ["-", " ", "  "];

type SeparatorAndIndex = {
  readonly separator: string;
  readonly index: number;
};

type PatternValue = string | number | null;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const isPatternValue = (value: any): value is PatternValue =>
  value === null || typeof value === "string" || typeof value === "number";

/**
 * A function that intelligently tries to infer what the next value should be in a table cell based
 * on the previous value and the previous previous value if one or either exist.
 *
 * The function is intelligent enough to recognize that when there is a "Separator" in the value, if
 * the prefixes before the "Separator" are consistent, the value can be inferred based on the
 * partial value after the "Separator".
 *
 * For instance, if we have values ["Account 100", "Account 200"], the "Separator" is " " - the
 * function will recognize that the prefix "Account" is the same for each value and thus the
 * inference can be made based on ["100", "200"].
 *
 * Usage:
 * -----
 * When attempting to detect the next value in a pattern, we either provide an array of length-1 in
 * the case that there is only one previous value, or an array of length-2 in the case that there
 * are 2 or more previous values.
 *
 * Note that we do not provide more than 2 previous values as only 2 are needed for the inferences
 * we are making here.
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
export const detectNextInPattern = (values: PreviousValues<PatternValue>): PatternValue => {
  const findLastSeparator = (value: string): SeparatorAndIndex | null => {
    const indices: number[] = SEPARATORS.map((sep: string) =>
      findLastIndex(value, (c: string) => c.toLowerCase() === sep.toLocaleLowerCase()),
    ).filter((i: number) => i !== -1);
    if (indices.length !== 0) {
      return {
        separator: value[Math.max(...indices)],
        index: Math.max(...indices),
      };
    }
    return null;
  };

  const separate = (value: string): [string, string, string] | null => {
    const separatorAndIndex = findLastSeparator(value);
    if (separatorAndIndex !== null) {
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
  if (numericValue !== null) {
    const previousNumericValue = toNumber(previousValue);
    if (previousNumericValue !== null) {
      if (previousNumericValue < numericValue) {
        const diff = numericValue - previousNumericValue;
        return typeof value === "string" ? String(numericValue + diff) : numericValue + diff;
      } else if (numericValue < previousNumericValue) {
        const diff = previousNumericValue - numericValue;
        return typeof value === "string" ? String(numericValue - diff) : numericValue - diff;
      } else {
        /* The numeric values are the same, but if we are not considering an equality part of a
           pattern then we should return null to indicate that we could not infer a pattern. */
        return null;
      }
    } else {
      return typeof value === "string" ? String(numericValue + 1) : numericValue + 1;
    }
  } else if (typeof value === "string") {
    /* If the value itself is not numeric, then maybe there is a prefix before a numeric value that
       we can infer from. */
    const separated = separate(value);
    if (separated !== null) {
      if (previousValue !== null && typeof previousValue === "string") {
        if (previousValue === value) {
          return null;
        }
        const previousSeparated = separate(previousValue);
        if (previousSeparated !== null && previousSeparated[1] === separated[1]) {
          const nextInPattern = detectNextInPattern([previousSeparated[2], separated[2]]);
          if (nextInPattern !== null) {
            return separated[0] + separated[1] + String(nextInPattern);
          }
        }
      }
    }
  }
  return null;
};

/*
Information required to detect patterns when in the context of AGGrid.  When using AGSource, the
rows will be pulled directly from the GridApi.

Note that if using an AGGrid source, the rows are pulled from the AGGrid table itself, not the
store.  In the case that the rows are pulled from the AGGrid table, we cannot generate data for
multiple rows because after the first generated RowData, generating each subsequent RowData object
requires the previously created RowNode in AGGrid (because it needs them to detect a pattern) - and
these RowNode(s) will not exist until after this function returns.
*/
type AGSource<R extends types.Row> = { readonly api: GridApi<R>; readonly newIndex?: number };

/*
Information required to detect patterns in the context of the reducers.  When in a reducer, the rows
will be pulled directly from the store.

Note that the elements of the array can be both BodyRow<R> (the rows in the store) or Partial<R>.
This is because when creating multiple rows, or creating rows very quickly, the full row may not
have been created yet at the time of usage - only the data being used to create the row via the API.
*/
type ReduxSource<R extends types.Row> = {
  readonly store: (types.RowSubType<R, types.BodyRowType> | types.RowData<R>)[];
  readonly newIndex?: number;
  readonly count?: number;
};

/*
The pattern detection logic needs to be able to work both inside the context of AGGrid or outside of
the context of AGGrid, in the reducers.
*/
type Source<R extends types.Row> = AGSource<R> | ReduxSource<R>;

const isAgSource = <R extends types.Row>(
  source: Source<R> | Omit<ReduxSource<R>, "count">,
): source is AGSource<R> => (source as AGSource<R>).api !== undefined;

const isReduxSource = <R extends types.Row>(
  source: Source<R>,
): source is ReduxSource<R> | Omit<ReduxSource<R>, "count"> =>
  (source as ReduxSource<R>).store !== undefined;

const getSourceIndex = <R extends types.Row>(
  source: AGSource<R> | Omit<ReduxSource<R>, "count">,
): number => {
  const numRows = isAgSource(source) ? aggrid.getRows(source.api).length : source.store.length;
  if (source.newIndex !== undefined) {
    if (source.newIndex > numRows) {
      logger.warn(
        { newIndex: source.newIndex, numRows },
        `New index ${source.newIndex} exceeds the number of rows (${numRows}). ` +
          `Defaulting to the end of the table/store at ${numRows}.`,
      );
      return numRows;
    }
    return source.newIndex;
  }
  return numRows;
};

type ModelRowOrData<R extends types.Row> =
  | types.RowSubType<R, "model">
  | types.RowData<R>
  | types.RowSubType<R, "placeholder">;

/**
 * Given the provided source information, determines what the previous ModelRow is or prevous 2
 * ModelRow(s) are in the case that there are 2 ModelRow(s) before the row at the designated index.
 * If there are no ModelRow(s) before the designated index, returns null.
 *
 * @param {AGSource<R> | Omit<ReduxSource<R>, "count">} source
 *   The information required to determine the table rows, either from the store directly or from
 *   AGGrid's GridApi.
 *
 * @returns { PreviousValues<ModelRowOrData<R>> | null}
 *   The previous 1 or 2 ModelRow(s) before the designated index, or null if there are no
 *   ModelRow(s) before the index.
 */
export const findPreviousModelRows = <R extends types.Row>(
  source: AGSource<R> | Omit<ReduxSource<R>, "count">,
  filling?: boolean,
): PreviousValues<ModelRowOrData<R>> | null => {
  /* If finding the previous ModelRow(s) from AG Grid, we can specify the index we are starting at,
     otherwise we start at the end of the table (in AG Grid context) or the end ot the store (in
     Reducer context). */
  let runningIndex = getSourceIndex(source);

  const isModelRowOrData = (
    r: types.RowSubType<R, types.BodyRowType> | types.RowData<R>,
  ): r is types.RowSubType<R, "model"> | types.RowData<R> | types.RowSubType<R, "placeholder"> =>
    typeguards.isRow(r) ? typeguards.isModelRow(r) || typeguards.isPlaceholderRow(r) : true;

  if (
    runningIndex === 0 ||
    (isReduxSource(source) &&
      source.store.filter((r: types.RowSubType<R, types.BodyRowType> | types.RowData<R>) =>
        isModelRowOrData(r),
      ).length === 0)
  ) {
    return null;
  }

  const getRowAtIndex = (
    index: number,
  ): types.RowSubType<R, types.BodyRowType> | types.RowData<R> | null => {
    if (isAgSource(source)) {
      /* The node should exist at the index because we check the validity of the index compared to
         the number of rows in the table in `getSourceIndex` - but this is mostly to make TS happy
         and to protect against edge cases. */
      const node = source.api.getDisplayedRowAtIndex(index);
      if (node !== undefined) {
        return node.data as types.RowSubType<R, types.BodyRowType>;
      }
      return null;
    }
    /* The index should be in the store because we check the validity of the index compared to the
       length of the store in `getSourceIndex` - so this is primarily to make TS happy. */
    return source.store[index] || null;
  };

  const modelRowsOrData: ModelRowOrData<R>[] = [];

  /* Because of how the timing of when the values are actually placed inside of the AGGrid table,
     when we are filling cells from a drag handle, we need to start one less than the index because
     the value is already assumed to be in the table. */
  if (filling) {
    runningIndex = runningIndex - 1;
  }

  let row: types.RowSubType<R, types.BodyRowType> | types.RowData<R> | null =
    getRowAtIndex(runningIndex);
  while (runningIndex > 0 && row !== null) {
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
  return modelRowsOrData as PreviousValues<ModelRowOrData<R>>;
};

const mapPreviousValues = <T, R>(values: PreviousValues<T>, fn: (v: T) => R): PreviousValues<R> =>
  values.length === 1 ? [fn(values[0])] : [fn(values[0]), fn(values[1])];

const detectPatternFromPreviousRows = <R extends types.Row>(
  /* We have to allow the previousRows to include both ModelRow(s) and partially created RowData
     because in the sagas, the full rows will not have been created yet, only the data that is used
     to create the new rows via the API. */
  previousRows: PreviousValues<ModelRowOrData<R>>,
  field: columns.ColumnFieldName<R>,
): PatternValue | null => {
  let columnSupportsSmartInference = true;

  const previousValues = mapPreviousValues<ModelRowOrData<R>, CellValue<R>>(
    previousRows,
    (ri: ModelRowOrData<R>): CellValue<R> => {
      /* If the object is a Row, then we know the value will not be undefined because we do not
         allow undefined values for Row(s).  In the worst case scenario, if it happened to slip in
         and avoid TS type checks, the below block of code would recognize that `undefined` is not a
         PatternValue and previous smart inference based on this column. */
      if (typeguards.isRow(ri)) {
        return ri.data[field] as CellValue<R>;
      }
      /* If the object is not a Row, and is a partially created RowData object, then the value will
         be undefined if the field does not exist in the Partial - which can happen if there is an
         inconsistency with generating row data from one row to the next.

         In this case, we cannot perform the smart inference, so we simply return `undefined` so
         that the next block of code will recognize the `undefined` value as not being a
         PatternValue and not perform the inference. */
      return ri[field];
    },
  );
  const patternValues: PatternValue[] = [];
  for (let i = 0; i < previousValues.length; i++) {
    const v = previousValues[i];
    if (isPatternValue(v)) {
      patternValues.push(v);
    } else {
      columnSupportsSmartInference = false;
      if (v === undefined) {
        logger.warn(
          { field },
          `Cannot perform smart inference as an undefined value was detected for column ${field}. ` +
            "This most likely means there is an inconstency with how the new row data is being " +
            "generated between any two given rows.",
        );
      } else {
        logger.warn(
          { field },
          `Smart inference is being used on column ${field} that has a data type (${typeof v}) ` +
            "that does not support smart inference.",
        );
      }
      break;
    }
  }
  if (columnSupportsSmartInference) {
    return detectNextInPattern(patternValues as PreviousValues<PatternValue>);
  }
  return null;
};

export const inferFillCellValue = <R extends types.Row, M extends model.RowTypedApiModel>(
  params: FillOperationParams,
  cs: columns.BodyColumn<R, M>[],
): CellValue<R> | null => {
  if (params.direction === "down") {
    const c: columns.BodyColumn<R, M> | null = columns.getColumn(cs, params.column.getColId());
    /* The column will be by default not-fake and readable (`isRead !== false`) since it is already
       in the table. */
    if (c !== null && c.smartInference === true && params.rowNode.rowIndex !== null) {
      const previousRows = findPreviousModelRows<R>(
        { api: params.api, newIndex: params.rowNode.rowIndex },
        true,
      );
      if (previousRows !== null) {
        return detectPatternFromPreviousRows(
          previousRows,
          params.column.getColId(),
        ) as CellValue<R>;
      }
    }
  }
  return null;
};

export const generateNewRowData = <R extends types.Row, M extends model.RowTypedApiModel>(
  source: Source<R>,
  cs: columns.BodyColumn<R, M>[],
): types.RowData<R>[] => {
  if (isReduxSource(source) && source.count !== undefined && source.count !== 1) {
    if (source.count === 0) {
      return [];
    }
    /* We need to keep track of the RowData objects that are created as we go, because in the case
       we are generating multiple RowData objects, the previously created RowData object needs to
       factor into the pattern recognition. */
    const runningRows: types.RowData<R>[] = [];
    for (let i = 0; i < source.count; i++) {
      const runningSource = { ...source, count: 1, store: [...source.store, ...runningRows] };
      const newRowData = generateNewRowData(runningSource, cs);
      runningRows.push(newRowData[0]);
    }
    return runningRows;
  }
  return [
    cs.reduce((prev: types.RowData<R>, c: columns.BodyColumn<R, M>): types.RowData<R> => {
      if (c.smartInference === true) {
        if (isAgSource(source) && source.newIndex !== undefined) {
          source = { ...source, newIndex: aggrid.getRows(source.api).length };
        }
        const previousRows = findPreviousModelRows<R>(source);
        if (previousRows !== null) {
          const inferred = detectPatternFromPreviousRows(previousRows, c.field);
          if (inferred !== null) {
            return { ...prev, [c.field]: inferred };
          }
        }
      }
      return prev;
    }, {} as types.RowData<R>),
  ];
};
