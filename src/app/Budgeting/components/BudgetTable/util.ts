import { forEach, includes, isNil, map } from "lodash";
import { ColDef, CellRange } from "@ag-grid-community/core";
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
