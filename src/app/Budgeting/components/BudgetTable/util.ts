import { forEach, includes, isNil, map, reduce, uniq, filter } from "lodash";
import Cookies from "universal-cookie";

export const validateCookiesHiddenColumns = <R extends Table.Row, M extends Model.Model>(
  obj: any,
  columns: Table.Column<R, M>[]
): GenericTable.Field<R, M>[] =>
  /* eslint-disable indent */
  Array.isArray(obj)
    ? uniq(
        reduce(
          obj,
          (fields: GenericTable.Field<R, M>[], iteree: any) => {
            if (
              typeof iteree === "string" &&
              includes(
                map(columns, (col: Table.Column<R, M>) => col.field),
                iteree
              )
            ) {
              return [...fields, iteree as GenericTable.Field<R, M>];
            }
            return fields;
          },
          [] as GenericTable.Field<R, M>[]
        )
      )
    : [];

export const getCookiesHiddenColumns = <R extends Table.Row, M extends Model.Model>(
  cookieName: string,
  columns: Table.Column<R, M>[],
  cookiesObj?: Cookies
): GenericTable.Field<R, M>[] => {
  cookiesObj = cookiesObj || new Cookies();
  const cookiesHiddenColumns = cookiesObj.get(cookieName);
  return validateCookiesHiddenColumns(cookiesHiddenColumns, columns);
};

export const changeCookiesColumnVisibility = <R extends Table.Row, M extends Model.Model>(
  cookieName: string,
  columns: Table.Column<R, M>[],
  change: { field: GenericTable.Field<R, M>; visible: boolean }
) => {
  const cookiesObj = new Cookies();

  let hiddenColumns = getCookiesHiddenColumns(cookieName, columns, cookiesObj);
  if (change.visible === true && includes(hiddenColumns, change.field)) {
    hiddenColumns = filter(hiddenColumns, (value: GenericTable.Field<R, M>) => value !== change.field);
    cookiesObj.set(cookieName, hiddenColumns);
  } else if (change.visible === false && !includes(hiddenColumns, change.field)) {
    cookiesObj.set(cookieName, [...hiddenColumns, change.field]);
  }
};

const validateCookiesFieldOrder = <R extends Table.Row, M extends Model.Model>(
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

export const validateCookiesOrdering = <R extends Table.Row, M extends Model.Model>(
  obj: any,
  cols: Table.Column<R, M>[]
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
