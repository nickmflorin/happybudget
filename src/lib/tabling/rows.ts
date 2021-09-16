import { isNil, reduce, filter } from "lodash";

import * as util from "../util";
import { consolidateTableChange } from "./events";
import { isAgColumn } from "./typeguards";

type Defaults = {
  name?: string | undefined;
  label?: string | undefined;
};

/* eslint-disable indent */
export const getFullRowLabel = <D extends Table.RowData, M extends Model.Model = Model.Model>(
  row: Table.Row<D, M>,
  defaults?: Defaults
): string | null => {
  const rowLabel: string | number | null | undefined = row.label || defaults?.label;
  const rowName: string | number | null | undefined = row.name || defaults?.name;
  if (!isNil(rowLabel) && !isNil(rowName)) {
    return `${rowName} ${rowLabel}`;
  } else if (!isNil(rowLabel)) {
    return String(rowLabel);
  } else if (!isNil(rowName)) {
    return String(rowName);
  } else {
    return null;
  }
};

export const mergeChangesWithRow = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  id: Table.RowID,
  row: Table.DataRow<R, M>,
  changes: Table.DataChangePayload<R, M>
): Table.DataRow<R, M> => {
  const consolidated: Table.ConsolidatedChange<R, M> = consolidateTableChange<R, M>(changes);
  return {
    ...row,
    data: reduce(
      consolidated,
      (curr: R, change: Table.RowChange<R, M>) => {
        if (change.id !== id) {
          /* eslint-disable no-console */
          console.error("Cannot apply table changes from one row to another row!");
          return curr;
        } else {
          let field: keyof R;
          for (field in change.data) {
            const cellChange = util.getKeyValue<Table.RowChangeData<R, M>, keyof R>(field)(
              change.data
            ) as Table.CellChange<R>;
            curr = { ...curr, [field as string]: cellChange.newValue };
          }
          return curr;
        }
      },
      { ...row.data }
    )
  };
};

export const createGroupRow = <R extends Table.RowData, M extends Model.Model, G extends Model.Group>(
  config: Table.CreateGroupRowConfig<R, M, G>
): Table.GroupRow<R> => {
  const readColumns = filter(config.columns, (c: Table.AnyColumn<R, M, G>) => !isAgColumn(c) || c.isRead !== false);
  const defaultNullValue = config.defaultNullValue === undefined ? null : config.defaultNullValue;
  const data: R = reduce(
    readColumns,
    (obj: R, col: Table.AnyColumn<R, M, G>) => {
      const field = !isNil(col.groupField) ? col.groupField : (col.field as unknown as keyof G);
      const nullValue = col.nullValue === undefined ? defaultNullValue : col.nullValue;
      if (!isNil(col.groupField) || col.applicableForGroup === true) {
        const groupValue = config.group[field as keyof G] as unknown as R[keyof R] | undefined;
        if (groupValue === undefined) {
          obj[field as keyof R] = nullValue as unknown as R[keyof R];
        } else {
          obj[field as keyof R] = groupValue;
        }
      }
      return obj;
    },
    {} as R
  );
  return {
    data,
    id: `group-${config.group.id}`,
    rowType: "group",
    gridId: "data",
    children: config.group.children,
    color: config.group.color,
    name: config.group.name,
    label: !isNil(config.getRowLabel)
      ? typeof config.getRowLabel === "function"
        ? config.getRowLabel(config.group)
        : config.getRowLabel
      : null,
    group: config.group.id
  };
};

export const createPlaceholderRow = <
  R extends Table.RowData,
  M extends Model.Model,
  G extends Model.Group = Model.Group
>(
  config: Table.CreatePlaceholderRowConfig<R, M, G>
): Table.PlaceholderRow<R> => {
  const readColumns = filter(config.columns, (c: Table.AnyColumn<R, M, G>) => !isAgColumn(c) || c.isRead !== false);
  const defaultNullValue = config.defaultNullValue === undefined ? null : config.defaultNullValue;
  const data: R = reduce(
    readColumns,
    (obj: R, col: Table.AnyColumn<R, M, G>) => {
      const nullValue = col.nullValue === undefined ? defaultNullValue : col.nullValue;
      const field = col.field;
      const dataValue = config.data[field];
      if (dataValue !== undefined) {
        obj[field] = dataValue as unknown as R[keyof R];
      } else {
        obj[field] = nullValue as unknown as R[keyof R];
      }
      return obj;
    },
    {} as R
  );
  return {
    data,
    id: config.id,
    rowType: "placeholder",
    // group: null,
    gridId: "data",
    name: !isNil(config.getRowName)
      ? typeof config.getRowName === "function"
        ? config.getRowName(config.data)
        : config.getRowName
      : null,
    label: !isNil(config.getRowLabel)
      ? typeof config.getRowLabel === "function"
        ? config.getRowLabel(config.data)
        : config.getRowLabel
      : null
  };
};

export const createModelRow = <R extends Table.RowData, M extends Model.Model, G extends Model.Group = Model.Group>(
  config: Omit<Table.CreateModelRowConfig<R, M, G>, "data">
): Table.ModelRow<R, M> => {
  const readColumns = filter(config.columns, (c: Table.AnyColumn<R, M, G>) => !isAgColumn(c) || c.isRead !== false);
  const defaultNullValue = config.defaultNullValue === undefined ? null : config.defaultNullValue;
  const data: R = reduce(
    readColumns,
    (obj: R, col: Table.AnyColumn<R, M, G>) => {
      const nullValue = col.nullValue === undefined ? defaultNullValue : col.nullValue;
      const field = col.field;
      const modelValue = !isNil(col.getRowValue)
        ? col.getRowValue(config.model)
        : util.getKeyValue<M, keyof M>(field as keyof M)(config.model);
      if (modelValue !== undefined) {
        obj[field] = modelValue as unknown as R[keyof R];
      } else {
        obj[field] = nullValue as unknown as R[keyof R];
      }
      return obj;
    },
    {} as R
  );
  return {
    data,
    id: config.model.id,
    rowType: "model",
    gridId: config.gridId,
    model: config.model,
    children: !isNil(config.getRowChildren) ? config.getRowChildren(config.model) : null,
    name: !isNil(config.getRowName)
      ? typeof config.getRowName === "function"
        ? config.getRowName(data, config.model)
        : config.getRowName
      : null,
    label: !isNil(config.getRowLabel)
      ? typeof config.getRowLabel === "function"
        ? config.getRowLabel(data, config.model)
        : config.getRowLabel
      : null
  };
};
