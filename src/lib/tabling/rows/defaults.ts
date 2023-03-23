import { isNil, reduce } from "lodash";

import { tabling } from "lib";

type Context = "update" | "create";

function insertDefaults<R extends Table.RowData, M extends model.RowTypedApiModel>(
  cs: Table.ModelColumn<R, M>[],
  data: R,
  defaults: Partial<R>,
  context: "update",
): R;

function insertDefaults<R extends Table.RowData, M extends model.RowTypedApiModel>(
  cs: Table.ModelColumn<R, M>[],
  data: Partial<R>,
  defaults: Partial<R>,
  context: "create",
): Partial<R>;

/**
 * Inserts the default values for the RowData object into the RowData object
 * based on the provided defaults and column definitions.
 *
 * When inserting defaults for a RowData object (R) in the update context, the
 * the RowData object (R) will always have values present for all the fields
 * associated with the defined Columns in the associated table.  This means that
 * the determination of whether or not the default should be used is made based
 * on whether or not the current value on the RowData object (R) for a given
 * field is equal to the definition of the `nullValue` for the Column associated
 * with that field.
 *
 * When inserting defaults for a RowData object (R) in the create context, the
 * RowData object is the partial form (Partial<R>).  This is because when
 * creating rows, only some of the values (if any) are required to be specified.
 * This means that the determination of whether or not the default should be
 * used is made based on both whether or not the current value on the partial
 * form of the RowData object (Partial<R>) is equal to the `nullValue` for
 * the associated Column as well as whether or not the value is included in the
 * partial form of the RowData object (Partial<R>).
 *
 * @param data Either the full RowData object (R) in the case of an update or
 *             the partial RowData object (Partial<R>) in the case of a create,
 *             without defaults applied.
 * @param defaults The default values, (Partial<R>) that should be inserted into
 *                 the RowData object.
 * @param columns The columns associated with the RowData object.
 * @param context: Whether or not the defaults are being inserted in an update
 *                 context or a create context.
 * @returns The original RowData object (either Partial<R> or R, depending on
 *          the context) with the defaults inserted.
 */
function insertDefaults<
  R extends Table.RowData,
  M extends model.RowTypedApiModel,
  D extends Partial<R> | R,
>(cs: Table.ModelColumn<R, M>[], data: D, defaults: Partial<R>, context: Context): D {
  let key: keyof R;
  for (key in defaults) {
    // A warning will be issued if the column is null.
    const column = tabling.columns.getColumn(cs, key);
    if (!isNil(column)) {
      if (data[key] === undefined) {
        if (context === "update") {
          console.warn(
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

export const applyDefaultsOnCreate = <R extends Table.RowData, M extends model.RowTypedApiModel>(
  cs: Table.ModelColumn<R, M>[],
  data?: Partial<R> | undefined,
  defaults?: Table.DefaultDataOnCreate<R>,
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
          typeof c.defaultValueOnCreate === "function"
            ? c.defaultValueOnCreate(definedData)
            : c.defaultValueOnCreate;
        return { ...curr, [c.field]: defaultValue };
      }
      return curr;
    },
    definedData,
  );

  if (defaults !== undefined) {
    return typeof defaults === "function"
      ? insertDefaults(cs, data, defaults(data), "create")
      : insertDefaults(cs, data, defaults, "create");
  }
  return data;
};

// export const applyDefaultsOnUpdate = <R extends Table.RowData, M extends model.RowTypedApiModel>(
//   cs: Table.ModelColumn<R, M>[],
//   row: Table.ModelRow<R>,
//   change: Table.RowChangeData<R, Table.ModelRow<R>>,
//   defaults?: Table.DefaultDataOnUpdate<R>,
// ): Table.ModelRow<R> => {
//   /* Apply defaults defined on the columns themselves before defaults are
//      are applied from the explicitly passed in default data. */
//   row = {
//     ...row,
//     data: reduce(
//       cs,
//       (curr: R, c: Table.ModelColumn<R, M>) => {
//         if (c.defaultValueOnCreate !== undefined && row.data[c.field] === undefined) {
//           /* Do not pass in the current data with defaults from the columns
// 					   applied up until this point, because the callback should expect
// 						 that the provided data does not yet include defaults - otherwise,
// 						 the result of the callback would depend on the order in which the
// 						 callbacks for each possible default are applied. */
//           const defaultValue =
//             typeof c.defaultValueOnUpdate === "function"
//               ? c.defaultValueOnUpdate(row)
//               : c.defaultValueOnUpdate;
//           return { ...curr, [c.field]: defaultValue };
//         }
//         return curr;
//       },
//       row.data,
//     ),
//   };
//   if (defaults !== undefined) {
//     return typeof defaults === "function"
//       ? { ...row, data: insertDefaults(cs, row.data, defaults(row, change), "update") }
//       : { ...row, data: insertDefaults(cs, row.data, defaults, "update") };
//   }
//   return row;
// };
