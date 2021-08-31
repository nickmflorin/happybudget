import { forEach, includes, isNil, map, reduce, uniq, filter } from "lodash";
import Cookies from "universal-cookie";

export const validateHiddenColumns = <R extends Table.Row, M extends Model.Model>(
  obj: any,
  validateAgainst?: Table.Field<R, M>[]
): Table.Field<R, M>[] | null => {
  if (!Array.isArray(obj)) {
    return null;
  } else {
    const validated = uniq(
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
    );
    // If there are columns present in the cookies but non are valid, we want to treat
    // it the same way we would if the cookies were invalid or null to begin with.  On the
    // other hand, if the value stored in cookies is an empty array, we want to treat that as
    // not columns being hidden.
    return validated.length === 0 && obj.length !== 0 ? null : validated;
  }
};

export const getHiddenColumns = <R extends Table.Row, M extends Model.Model>(
  cookieName: string,
  validateAgainst?: Table.Field<R, M>[]
): Table.Field<R, M>[] | null => {
  const cookiesObj = new Cookies();
  const cookiesHiddenColumns = cookiesObj.get(cookieName);
  return validateHiddenColumns(cookiesHiddenColumns, validateAgainst);
};

export const applyHiddenColumnChanges = <R extends Table.Row, M extends Model.Model>(
  changes: SingleOrArray<Table.ColumnVisibilityChange<R, M>>,
  hiddenColumns: Table.Field<R, M>[]
): Table.Field<R, M>[] => {
  const applyHiddenColumnChange = (
    change: Table.ColumnVisibilityChange<R, M>,
    cols: Table.Field<R, M>[]
  ): Table.Field<R, M>[] => {
    if (change.visible === true && includes(cols, change.field)) {
      return filter(cols, (value: Table.Field<R, M>) => value !== change.field);
    } else if (change.visible === false && !includes(cols, change.field)) {
      return [...cols, change.field];
    }
    return cols;
  };

  changes = Array.isArray(changes) ? changes : [changes];
  return reduce(
    changes,
    (fields: Table.Field<R, M>[], change: Table.ColumnVisibilityChange<R, M>) =>
      applyHiddenColumnChange(change, fields),
    hiddenColumns
  );
};

export const getHiddenColumnsAfterChanges = <R extends Table.Row, M extends Model.Model>(
  cookieName: string,
  changes: SingleOrArray<Table.ColumnVisibilityChange<R, M>>
): Table.Field<R, M>[] => {
  const hiddenColumns = getHiddenColumns(cookieName) || [];
  return applyHiddenColumnChanges(changes, hiddenColumns);
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
