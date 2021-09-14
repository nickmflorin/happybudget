import { isNil, reduce, filter, uniqBy } from "lodash";

import * as model from "../model";
import * as util from "../util";
import { consolidateTableChange } from "./events";
import { isAgColumn } from "./typeguards";

type Defaults = {
  name?: string | undefined;
  label?: string | undefined;
};

/* eslint-disable indent */
export const findDistinctRowsForEachGroupRow = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  rws: Table.DataRow<R, M>[],
  groups: Table.GroupRow<R>[]
): { group: Table.GroupRow<R>; rows: Table.DataRow<R, M>[] }[] => {
  return reduce(
    uniqBy(groups, (g: Table.GroupRow<R>) => g.id),
    (curr: { group: Table.GroupRow<R>; rows: Table.DataRow<R, M>[] }[], group: Table.GroupRow<R>) => {
      const children = model.util.getModelsByIds(rws, group.meta.children);
      if (children.length !== 0) {
        return [...curr, { rows: children, group }];
      }
      return curr;
    },
    []
  );
};

/* eslint-disable indent */
export const getFullRowLabel = <D extends Table.RowData, M extends Model.Model = Model.Model>(
  row: Table.Row<D, M>,
  defaults?: Defaults
): string | null => {
  const rowLabel: string | number | null | undefined = row.meta.label || defaults?.label;
  const rowName: string | number | null | undefined = row.meta.name || defaults?.name;
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
  row: Table.Row<R, M>,
  changes: Table.DataChangePayload<R, M>
): Table.Row<R, M> => {
  const consolidated: Table.ConsolidatedChange<R, M> = consolidateTableChange<R, M>(changes);
  return reduce(
    consolidated,
    (curr: Table.Row<R, M>, change: Table.RowChange<R, M>) => {
      if (change.id !== id) {
        /* eslint-disable no-console */
        console.error("Cannot apply table changes from one row to another row!");
        return curr;
      } else {
        let field: keyof R;
        for (field in change.data) {
          const cellChange = util.getKeyValue<Table.RowChangeData<R, M>, keyof R>(field)(
            change.data
          ) as Table.CellChange<R, M>;
          curr = { ...curr, [field as string]: cellChange.newValue };
        }
        return curr;
      }
    },
    { ...row }
  );
};

/* eslint-disable indent */
export const createModelRowMeta = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  config: Table.CreateModelRowConfig<R, M>
): Table.ModelRowMeta<M> => {
  return {
    gridId: config.gridId,
    model: config.model,
    children: !isNil(config.getRowChildren) ? config.getRowChildren(config.model) : null,
    name: !isNil(config.getRowName)
      ? typeof config.getRowName === "function"
        ? config.getRowName(config.data, config.model)
        : config.getRowName
      : null,
    label: !isNil(config.getRowLabel)
      ? typeof config.getRowLabel === "function"
        ? config.getRowLabel(config.data, config.model)
        : config.getRowLabel
      : null
  };
};

export const createPlaceholderRowMeta = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  config: Table.CreatePlaceholderRowConfig<R, M>
): Table.PlaceholderRowMeta => {
  return {
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

export const createGroupRowMeta = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  config: Table.CreateGroupRowConfig<R, M, G>
): Table.GroupRowMeta => {
  return {
    gridId: "data",
    children: config.group.children,
    group: config.group.id,
    name: !isNil(config.getRowName)
      ? typeof config.getRowName === "function"
        ? config.getRowName(config.group)
        : config.getRowName
      : null,
    label: !isNil(config.getRowLabel)
      ? typeof config.getRowLabel === "function"
        ? config.getRowLabel(config.group)
        : config.getRowLabel
      : null
  };
};

export const createGroupRow = <R extends Table.RowData, M extends Model.Model, G extends Model.Group>(
  config: Table.CreateGroupRowConfig<R, M, G>
): Table.GroupRow<R> | null => {
  const readColumns = filter(config.columns, (c: Table.AnyColumn<R, M>) => !isAgColumn(c) || c.isRead !== false);
  const defaultNullValue = config.defaultNullValue === undefined ? null : config.defaultNullValue;
  if (readColumns.length !== 0) {
    return reduce(
      readColumns,
      (obj: Table.GroupRow<R>, col: Table.AnyColumn<R, M>) => {
        const nullValue = col.nullValue === undefined ? defaultNullValue : col.nullValue;
        const field = col.field;
        if (col.applicableForGroup === true) {
          const groupValue = config.group[field as keyof G] as unknown as Table.GroupRow<R>[keyof R] | undefined;
          if (!isNil(groupValue)) {
            obj[field] = groupValue;
          } else {
            obj[field] = nullValue as unknown as Table.GroupRow<R>[keyof R];
          }
        } else {
          obj[field] = nullValue as unknown as Table.GroupRow<R>[keyof R];
        }
        return obj;
      },
      {
        id: `group-${config.group.id}`,
        [readColumns[0].field]: config.group.name,
        rowType: "group",
        meta: createGroupRowMeta<R, M, G>(config),
        color: config.group.color
      } as Table.GroupRow<R>
    );
  }
  return null;
};

export const createPlaceholderRow = <R extends Table.RowData, M extends Model.Model>(
  config: Table.CreatePlaceholderRowConfig<R, M>
): Table.PlaceholderRow<R> => {
  const readColumns = filter(config.columns, (c: Table.AnyColumn<R, M>) => !isAgColumn(c) || c.isRead !== false);
  const defaultNullValue = config.defaultNullValue === undefined ? null : config.defaultNullValue;
  const data: R = reduce(
    readColumns,
    (obj: R, col: Table.AnyColumn<R, M>) => {
      const nullValue = col.nullValue === undefined ? defaultNullValue : col.nullValue;
      const field = col.field;
      const dataValue = config.data[field];
      if (dataValue !== undefined) {
        obj[field] = dataValue as unknown as Table.PlaceholderRow<R>[keyof R];
      } else {
        obj[field] = nullValue as unknown as Table.PlaceholderRow<R>[keyof R];
      }
      return obj;
    },
    {} as R
  );
  return {
    ...data,
    id: config.id,
    rowType: "placeholder",
    meta: createPlaceholderRowMeta<R, M>({ ...config, data })
  };
};

export const createModelRow = <R extends Table.RowData, M extends Model.Model>(
  config: Omit<Table.CreateModelRowConfig<R, M>, "data">
): Table.ModelRow<R, M> => {
  const readColumns = filter(config.columns, (c: Table.AnyColumn<R, M>) => !isAgColumn(c) || c.isRead !== false);
  const defaultNullValue = config.defaultNullValue === undefined ? null : config.defaultNullValue;
  const data: R = reduce(
    readColumns,
    (obj: R, col: Table.AnyColumn<R, M>) => {
      const nullValue = col.nullValue === undefined ? defaultNullValue : col.nullValue;
      const field = col.field;
      const modelValue = !isNil(col.getRowValue)
        ? col.getRowValue(config.model)
        : util.getKeyValue<M, keyof M>(field as keyof M)(config.model);
      if (modelValue !== undefined) {
        obj[field] = modelValue as unknown as Table.ModelRow<R, M>[keyof R];
      } else {
        obj[field] = nullValue as unknown as Table.ModelRow<R, M>[keyof R];
      }
      return obj;
    },
    {} as R
  );
  return {
    ...data,
    id: config.model.id,
    rowType: "model",
    meta: createModelRowMeta({ ...config, data })
  };
};
