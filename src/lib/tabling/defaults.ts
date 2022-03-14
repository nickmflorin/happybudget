import { isNil, reduce } from "lodash";

import * as columns from "./columns";

/**
 * Inserts the default values for the RowData object into the RowData object
 * based on the provided defaults and column definitions.
 *
 * The default values are determined either from the
 * A RowData object will always have values present for all the fields defined
 * on the set of Columns for the table, and the values will never be undefined.
 * This means that in order to determine whether or not the default should be
 * used, we have to determine whether or not the current value on the RowData
 * object for a given field is equal to the definition of the `nullValue` for
 * the Column associated with that field.
 *
 * @param data The original RowData object without any defaults applied.
 * @param defaults The defaults that should be inserted into the RowData object.
 * @param columns The columns associated with the RowData object.
 * @returns
 */
const _insertDefaults = <R extends Table.RowData, M extends Model.RowHttpModel, D extends Partial<R> | R = Partial<R>>(
  cs: Table.ModelColumn<R, M>[],
  data: D,
  defaults: D
): D => {
  let key: keyof R;
  for (key in defaults) {
    // A warning will be issued if the column is null.
    const column = columns.getColumn(cs, key);
    if (!isNil(column)) {
      if (data[key] === undefined) {
        console.warn(
          `Encountered an undefined value for column ${key} when attempting to set default values on the row.`
        );
      } else if (data[key] === column.nullValue) {
        data = { ...data, [key]: defaults[key] };
      }
    }
  }
  return data;
};

export const applyDefaultsOnCreate = <R extends Table.RowData, M extends Model.RowHttpModel>(
  cs: Table.ModelColumn<R, M>[],
  data?: Partial<R> | undefined,
  defaults?: Table.DefaultDataOnCreate<R>
): Partial<R> | undefined => {
  const definedData: Partial<R> = data || {};

  /* Apply defaults defined on the columns themselves before defaults are
     are applied from the explicitly passed in default data. */
  data = reduce(
    cs,
    (curr: Partial<R>, c: Table.ModelColumn<R, M>) => {
      if (c.defaultValueOnCreate !== undefined && definedData[c.field] === undefined) {
        /* Do not pass in the current data with defaults from the columns applied
           up until this point, because the callback should expect that the
					 provided data does not yet include defaults - otherwise, the result
					 of the callback would depend on the order in which the callbacks for
					 each possible default are applied. */
        const defaultValue =
          typeof c.defaultValueOnCreate === "function" ? c.defaultValueOnCreate(definedData) : c.defaultValueOnCreate;
        return { ...curr, [c.field]: defaultValue };
      }
      return curr;
    },
    definedData
  );

  if (defaults !== undefined) {
    return typeof defaults === "function"
      ? _insertDefaults<R, M, Partial<R>>(cs, data, defaults(data))
      : _insertDefaults<R, M, Partial<R>>(cs, data, defaults);
  }
  return data;
};

export const applyDefaultsOnUpdate = <R extends Table.RowData, M extends Model.RowHttpModel>(
  cs: Table.ModelColumn<R, M>[],
  row: Table.ModelRow<R>,
  defaults?: Table.DefaultDataOnUpdate<R>
): Table.ModelRow<R> => {
  /* Apply defaults defined on the columns themselves before defaults are
     are applied from the explicitly passed in default data. */
  row = {
    ...row,
    data: reduce(
      cs,
      (curr: R, c: Table.ModelColumn<R, M>) => {
        if (c.defaultValueOnCreate !== undefined && row.data[c.field] === undefined) {
          /* Do not pass in the current data with defaults from the columns
					   applied up until this point, because the callback should expect
						 that the provided data does not yet include defaults - otherwise,
						 the result of the callback would depend on the order in which the
						 callbacks for each possible default are applied. */
          const defaultValue =
            typeof c.defaultValueOnUpdate === "function" ? c.defaultValueOnUpdate(row) : c.defaultValueOnUpdate;
          return { ...curr, [c.field]: defaultValue };
        }
        return curr;
      },
      row.data
    )
  };
  if (defaults !== undefined) {
    return typeof defaults === "function"
      ? { ...row, data: _insertDefaults<R, M, R>(cs, row.data, defaults(row)) }
      : { ...row, data: _insertDefaults<R, M, R>(cs, row.data, defaults) };
  }
  return row;
};
