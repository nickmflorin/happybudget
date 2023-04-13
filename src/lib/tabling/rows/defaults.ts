import { logger } from "internal";

import * as model from "../../model";
import * as columns from "../columns";
import * as events from "../events";
import { CellValue } from "../types";

import * as types from "./types";

type Context = "update" | "create";

export type DefaultValueOnCreate<
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = T | ((r: Partial<types.GetRowData<R>>) => T);

export type DefaultValueOnUpdate<
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = T | ((r: types.RowSubType<R, "model">) => T);

/* Typecheck is necessary because T does not exclude function types - but that would be a severe
   edge cases so simply checking that the value is a function suffices. */
const defaultValueOnCreateIsFn = <
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  v: DefaultValueOnCreate<R, N, T>,
): v is (r: Partial<types.GetRowData<R>>) => T => typeof v === "function";

/* Typecheck is necessary because T does not exclude function types - but that would be a severe
   edge cases so simply checking that the value is a function suffices. */
const defaultValueOnUpdateIsFn = <
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  v: DefaultValueOnUpdate<R, N, T>,
): v is (r: types.RowSubType<R, "model">) => T => typeof v === "function";

export type DefaultDataOnCreate<
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> =
  | Partial<types.GetRowData<R, N, T>>
  | ((r: Partial<types.GetRowData<R, N, T>>) => Partial<types.GetRowData<R, N, T>>);

export type DefaultDataOnUpdate<
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> =
  | types.GetRowData<R, N, T>
  | ((
      r: types.RowSubType<R, "model">,
      ch: events.RowChangeData<R>,
    ) => Partial<types.GetRowData<R, N, T>>);

function insertDefaults<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  cs: columns.ModelColumn<R, M, N, T>[],
  data: types.GetRowData<R, N, T>,
  defaults: Partial<types.GetRowData<R, N, T>>,
  context: "update",
): types.GetRowData<R, N, T>;

function insertDefaults<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  cs: columns.ModelColumn<R, M, N, T>[],
  data: Partial<types.GetRowData<R, N, T>>,
  defaults: Partial<types.GetRowData<R, N, T>>,
  context: "create",
): Partial<types.GetRowData<R, N, T>>;

/**
 * Updates the row data, {@link D}, of a given row, {@link R}, or creates the initial row data,
 * {@link D}, for a given row, {@link R}, based on provided default values for the row data object,
 * {@link Partial<types.GetRowData<R>>} and provided columns definitions.
 *
 * In the update context, the row data object {@link D} will always have all values present for
 * all fields associated with the defined columns in the associated table.  This means that the
 * determination of whether or not the default should be used is made based on whether or not the
 * current value in the row data object, {@link D}, for a given field, is equal to the definition
 * of the 'nullValue' for the column associated with that field.
 *
 * In the create context, the row data object {@link D} is a partial form of the row's row data,
 * {@link types.GetRowData<R>}, because when creating rows, only some of the values (if any) are
 * required to be specified.  This means that the determination of whether or not the default should
 * be used is made based on both whether or not the current value on the partial form of the row
 * data object, {@link D}, is equal to the 'nullValue' for the associated column as well as whether
 * or not the value is included in the partial form of the row data object, {@link D}.
 *
 * @param {D} data
 *   Either the full row data object {@link types.GetRowData<R>} in the update context, or the
 *   partial row data object, {@link Partial<types.GetRowData<R>>} in the create context.
 *
 * @param {Partial<types.GetRowData<R>>} defaults
 *   The default values that should be inserted into the row data object.
 *
 * @param {columns.ModelColumn<R, M>[]} columns The columns associated with the row data object.
 *
 * @param {Context} context
 *   Whether or not the defaults are being inserted in an update context or a create context.
 *
 * @returns {D}
 */
function insertDefaults<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  cs: columns.ModelColumn<R, M, N, T>[],
  data: Partial<types.GetRowData<R, N, T>> | types.GetRowData<R, N, T>,
  defaults: Partial<types.GetRowData<R, N, T>>,
  context: Context,
) {
  let key: columns.ColumnFieldName<R>;
  for (key in defaults) {
    // A warning will be issued if the column is null.
    const column = columns.getColumn(cs, key);
    if (column !== null) {
      if (data[key] === undefined) {
        if (context === "update") {
          logger.warn(
            { key: String(key), column: column.field },
            `Encountered an undefined value for column ${String(
              key,
            )} when attempting to set default values on the row.`,
          );
        } else {
          data = { ...data, [key]: defaults[key] };
        }
      } else if (data[key] === column.nullValue) {
        data = { ...data, [key]: defaults[key] };
      }
    }
  }
  return data;
}

export const applyDefaultsOnCreate = <
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  cs: columns.ModelColumn<R, M, N, T>[],
  data?: Partial<types.GetRowData<R, N, T>> | undefined,
  defaults?: DefaultDataOnCreate<R, N, T>,
): Partial<types.GetRowData<R, N, T>> | undefined => {
  const definedData: Partial<types.GetRowData<R, N, T>> = data || {};
  /* Apply defaults defined on the columns themselves before defaults are are applied from the
     explicitly passed in default data. */
  data = cs.reduce(
    (
      curr: Partial<types.GetRowData<R, N, T>>,
      c: columns.ModelColumn<R, M, N, T>,
    ): Partial<types.GetRowData<R, N, T>> => {
      if (c.defaultValueOnCreate !== undefined && definedData[c.field] === undefined) {
        /* Do not pass in the current data with defaults from the columns applied up until this
           point, because the callback should expect that the provided data does not yet include
           defaults - otherwise, the result of the callback would depend on the order in which the
           callbacks for each possible default are applied. */
        const defaultValue = defaultValueOnCreateIsFn(c.defaultValueOnCreate)
          ? c.defaultValueOnCreate(definedData)
          : c.defaultValueOnCreate;
        return { ...curr, [c.field]: defaultValue };
      }
      return curr;
    },
    {} as Partial<types.GetRowData<R, N, T>>,
  );
  if (defaults !== undefined) {
    return typeof defaults === "function"
      ? insertDefaults<R, M, N, T>(cs, data, defaults(data), "create")
      : insertDefaults<R, M, N, T>(cs, data, defaults, "create");
  }
  return data;
};

export const applyDefaultsOnUpdate = <
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  cs: columns.ModelColumn<R, M, N, T>[],
  row: types.RowSubType<R, "model">,
  change: events.RowChangeData<R>,
  defaults?: DefaultDataOnUpdate<R, N, T>,
): types.RowSubType<R, "model"> => {
  /* Apply defaults defined on the columns themselves before defaults are are applied from the
     explicitly passed in default data. */
  row = {
    ...row,
    data: cs.reduce((curr: types.GetRowData<R, N, T>, c: columns.ModelColumn<R, M, N, T>) => {
      if (c.defaultValueOnUpdate !== undefined && row.data[c.field] === undefined) {
        /* Do not pass in the current data with defaults from the columns applied up until this
           point, because the callback should expect that the provided data does not yet include
           defaults - otherwise, the result of the callback would depend on the order in which the
					 callbacks for each possible default are applied. */
        const defaultValue = defaultValueOnUpdateIsFn(c.defaultValueOnUpdate)
          ? c.defaultValueOnUpdate(row)
          : c.defaultValueOnUpdate;
        return { ...curr, [c.field]: defaultValue };
      }
      return curr;
    }, row.data),
  };
  if (defaults !== undefined) {
    return typeof defaults === "function"
      ? { ...row, data: insertDefaults(cs, row.data, defaults(row, change), "update") }
      : { ...row, data: insertDefaults(cs, row.data, defaults, "update") };
  }
  return row;
};
