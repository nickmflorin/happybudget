import { forEach, includes, isNil, map, reduce, uniq, filter } from "lodash";
import Cookies from "universal-cookie";

export const validateHiddenColumns = <R extends Table.Row, M extends Model.Model>(
  obj: any,
  validateAgainst?: Table.Field<R, M>[]
): Table.Field<R, M>[] =>
  /* eslint-disable indent */
  Array.isArray(obj)
    ? uniq(
        reduce(
          obj,
          (fields: Table.Field<R, M>[], iteree: any) => {
            if (typeof iteree === "string" && (isNil(validateAgainst) || includes(validateAgainst, iteree))) {
              return [...fields, iteree as Table.Field<R, M>];
            }
            return fields;
          },
          [] as Table.Field<R, M>[]
        )
      )
    : [];

export const getHiddenColumns = <R extends Table.Row, M extends Model.Model>(
  cookieName: string,
  validateAgainst?: Table.Field<R, M>[]
): Table.Field<R, M>[] => {
  const cookiesObj = new Cookies();
  const cookiesHiddenColumns = cookiesObj.get(cookieName);
  return validateHiddenColumns(cookiesHiddenColumns, validateAgainst);
};

const applyHiddenColumnChange = <R extends Table.Row, M extends Model.Model>(
  change: Table.ColumnVisibilityChange<R, M>,
  hiddenColumns: Table.Field<R, M>[]
): Table.Field<R, M>[] => {
  if (change.visible === true && includes(hiddenColumns, change.field)) {
    hiddenColumns = filter(hiddenColumns, (value: Table.Field<R, M>) => value !== change.field);
    return hiddenColumns;
  } else if (change.visible === false && !includes(hiddenColumns, change.field)) {
    return [...hiddenColumns, change.field];
  }
  return hiddenColumns;
};

export const getHiddenColumnsAfterChanges = <R extends Table.Row, M extends Model.Model>(
  cookieName: string,
  changes: SingleOrArray<Table.ColumnVisibilityChange<R, M>>
): Table.Field<R, M>[] => {
  const hiddenColumns = getHiddenColumns(cookieName);
  const arrayOfChanges = Array.isArray(changes) ? changes : [changes];
  return reduce(
    arrayOfChanges,
    (fields: Table.Field<R, M>[], change: Table.ColumnVisibilityChange<R, M>) =>
      applyHiddenColumnChange(change, fields),
    hiddenColumns
  );
};

export const setHiddenColumns = <R extends Table.Row, M extends Model.Model>(
  cookieName: string,
  fields: Table.Field<R, M>[]
) => {
  const cookiesObj = new Cookies();
  cookiesObj.set(cookieName, fields);
};

export const updateHiddenColumns = <R extends Table.Row, M extends Model.Model>(
  cookieName: string,
  changes: SingleOrArray<Table.ColumnVisibilityChange<R, M>>
): Table.Field<R, M>[] => {
  const hiddenColumns = getHiddenColumnsAfterChanges(cookieName, changes);
  setHiddenColumns(cookieName, hiddenColumns);
  return hiddenColumns;
};

const validateFieldOrder = <R extends Table.Row, M extends Model.Model>(
  obj: any,
  cols: Table.Column<R, M>[]
): FieldOrder<keyof R> | null => {
  if (
    typeof obj === "object" &&
    !isNil(obj.field) &&
    !isNil(obj.order) &&
    typeof obj.field === "string" &&
    includes([-1, 0, 1], obj.order) &&
    includes(
      map(cols, (col: Table.Column<R, M>) => col.field),
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

export const validateOrdering = <R extends Table.Row, M extends Model.Model>(
  obj: any,
  cols: Table.Column<R, M>[]
): FieldOrder<keyof R>[] | null => {
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return [];
    }
    const validatedOrdering: FieldOrder<keyof R>[] = [];
    forEach(obj, (element: any) => {
      const fieldOrder = validateFieldOrder(element, cols);
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
