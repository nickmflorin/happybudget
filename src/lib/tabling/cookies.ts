import { includes, isNil, reduce, uniq, filter } from "lodash";
import Cookies from "universal-cookie";

export const validateHiddenColumns = <R extends Table.RowData>(
  obj: any,
  validateAgainst?: (keyof R | string)[]
): (keyof R | string)[] | null => {
  if (!Array.isArray(obj)) {
    return null;
  } else {
    const validated = uniq(
      reduce(
        obj,
        (fields: (keyof R)[], iteree: keyof R) => {
          if (typeof iteree === "string" && (isNil(validateAgainst) || includes(validateAgainst, iteree))) {
            return [...fields, iteree as keyof R];
          }
          return fields;
        },
        [] as (keyof R)[]
      )
    );
    // If there are columns present in the cookies but non are valid, we want to treat
    // it the same way we would if the cookies were invalid or null to begin with.  On the
    // other hand, if the value stored in cookies is an empty array, we want to treat that as
    // not columns being hidden.
    return validated.length === 0 && obj.length !== 0 ? null : validated;
  }
};

export const getHiddenColumns = <R extends Table.RowData>(
  cookieName: string,
  validateAgainst?: (keyof R | string)[]
): (keyof R | string)[] | null => {
  const cookiesObj = new Cookies();
  const cookiesHiddenColumns = cookiesObj.get(cookieName);
  return validateHiddenColumns(cookiesHiddenColumns, validateAgainst);
};

export const applyHiddenColumnChanges = <R extends Table.RowData>(
  changes: SingleOrArray<Table.ColumnVisibilityChange<R>>,
  hiddenColumns: (keyof R | string)[]
): (keyof R | string)[] => {
  const applyHiddenColumnChange = (
    change: Table.ColumnVisibilityChange<R>,
    cols: (keyof R | string)[]
  ): (keyof R | string)[] => {
    if (change.visible === true && includes(cols, change.field)) {
      return filter(cols, (value: keyof R | string) => value !== change.field);
    } else if (change.visible === false && !includes(cols, change.field)) {
      return [...cols, change.field];
    }
    return cols;
  };

  changes = Array.isArray(changes) ? changes : [changes];
  return reduce(
    changes,
    (fields: (keyof R | string)[], change: Table.ColumnVisibilityChange<R>) => applyHiddenColumnChange(change, fields),
    hiddenColumns
  );
};

export const getHiddenColumnsAfterChanges = <R extends Table.RowData>(
  cookieName: string,
  changes: SingleOrArray<Table.ColumnVisibilityChange<R>>
): (keyof R | string)[] => {
  const hiddenColumns = getHiddenColumns(cookieName) || [];
  return applyHiddenColumnChanges(changes, hiddenColumns);
};

export const setHiddenColumns = <R extends Table.RowData>(cookieName: string, fields: (keyof R | string)[]) => {
  const cookiesObj = new Cookies();
  cookiesObj.set(cookieName, fields);
};

export const updateHiddenColumns = <R extends Table.RowData>(
  cookieName: string,
  changes: SingleOrArray<Table.ColumnVisibilityChange<R>>
): (keyof R | string)[] => {
  const hiddenColumns = getHiddenColumnsAfterChanges(cookieName, changes);
  setHiddenColumns(cookieName, hiddenColumns);
  return hiddenColumns;
};
