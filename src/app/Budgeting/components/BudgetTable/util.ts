import { forEach, includes, isNil, map, uniq } from "lodash";
import classNames from "classnames";
import { ColDef, CellRange, CellClassParams } from "@ag-grid-community/core";
import { CustomColDef } from "./model";

export const originalColDef = (colDef: CustomColDef<any, any>) => {
  const {
    nullValue,
    clearBeforeEdit,
    isCalculated,
    budgetTotal,
    tableTotal,
    processCellForClipboard,
    processCellFromClipboard,
    ...original
  } = colDef;
  return original;
};

export const rangeSelectionIsSingleCell = (range: CellRange) => {
  if (range.startRow?.rowIndex === range.endRow?.rowIndex && range.columns.length === 1) {
    return true;
  }
  return false;
};

const validateCookiesFieldOrder = <R extends Table.Row>(obj: any, cols: ColDef[]): FieldOrder<keyof R> | null => {
  if (
    typeof obj === "object" &&
    !isNil(obj.field) &&
    !isNil(obj.order) &&
    typeof obj.field === "string" &&
    includes([-1, 0, 1], obj.order) &&
    includes(
      map(cols, (col: ColDef) => col.field),
      obj.field
    )
  ) {
    return {
      field: obj.field,
      order: obj.order
    };
  }
  return null;
};

export const validateCookiesOrdering = <R extends Table.Row>(
  obj: any,
  cols: ColDef[]
): FieldOrder<keyof R>[] | null => {
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return [];
    }
    const validatedOrdering: FieldOrder<keyof R>[] = [];
    forEach(obj, (element: any) => {
      const fieldOrder = validateCookiesFieldOrder(element, cols);
      if (!isNil(fieldOrder)) {
        validatedOrdering.push(fieldOrder);
      }
    });
    // If there were no valid orders set, we don't want to set [] ordering, we want to not set it
    // at all.
    if (validatedOrdering.length === 0) {
      return null;
    }
    return validatedOrdering;
  }
  return null;
};

type AGGridCellClassFn = (params: CellClassParams) => string | string[] | undefined;
type ClassNameConstruct = string | string[] | AGGridCellClassFn | undefined | { [key: string]: boolean };

export const mergeClassNames = (params: CellClassParams, ...args: ClassNameConstruct[]): string => {
  const stringClassNames = map(args, (arg: ClassNameConstruct) => {
    if (typeof arg === "function") {
      return arg(params);
    }
    return arg;
  });
  return classNames(stringClassNames);
};

export const mergeClassNamesFn = (...args: ClassNameConstruct[]) => (params: CellClassParams) => {
  return mergeClassNames(params, ...args);
};

export const mergeRowChanges = (changes: Table.RowChange<any>[]): Table.RowChange<any> => {
  if (changes.length !== 0) {
    if (uniq(map(changes, (change: Table.RowChange<any>) => change.id)).length !== 1) {
      throw new Error("Cannot merge row changes for different rows!");
    }
    const merged: Table.RowChange<any> = { id: changes[0].id, data: {} };
    forEach(changes, (change: Table.RowChange<any>) => {
      merged.data = { ...merged.data, ...change.data };
    });
    return merged;
  } else {
    throw new Error("Must provide at least 1 row change.");
  }
};
