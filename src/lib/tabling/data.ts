import { includes, groupBy, isNil, reduce, find, filter, map, orderBy, uniqBy } from "lodash";

import { model } from "lib";
import * as rows from "./rows";

/* eslint-disable indent */
export const findDistinctRowsForEachGroup = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  rws: Table.DataRow<R, M>[],
  groups: G[]
): { group: G; rows: Table.DataRow<R, M>[] }[] => {
  return reduce(
    uniqBy(groups, (g: G) => g.id),
    (curr: { group: G; rows: Table.DataRow<R, M>[] }[], group: G) => {
      const children = model.util.getModelsByIds(rws, group.children);
      if (children.length !== 0) {
        return [...curr, { rows: children, group }];
      }
      return curr;
    },
    []
  );
};

export const orderModelsWithRowsByFieldOrdering = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  array: Table.ModelWithRow<R, M>[],
  fieldOrdering: FieldOrdering<keyof R>
): Table.ModelWithRow<R, M>[] => {
  return orderBy(
    array,
    (row: Table.ModelWithRow<R, M>) =>
      map(fieldOrdering, (fieldOrder: FieldOrder<keyof R>) => row.row[fieldOrder.field]),
    map(fieldOrdering, (fieldOrder: FieldOrder<keyof R>) => (fieldOrder.order === 1 ? "asc" : "desc"))
  );
};

/* eslint-disable indent */
export const createTableData = <R extends Table.RowData, M extends Model.Model, G extends Model.Group = Model.Group>(
  config: Table.CreateTableDataConfig<R, M, G>
): Table.TableData<R, M, G> => {
  const getGroupForModel = (m: M): G | null => find(config.groups, (g: G) => includes(g.children, m.id)) || null;

  const orderModelsWithRows = (rws: Table.ModelWithRow<R, M>[]) =>
    !isNil(config.ordering) ? orderModelsWithRowsByFieldOrdering<R, M>(rws, config.ordering) : rws;

  // Using the separately provided list of full group <G> models, attribute each model (if applicable)
  // with it's full group <G> model based on the group ID attributed to the model <M>.
  const modelsAndGroups: { model: M; group: G | null }[] = map(config.models, (m: M) => ({
    model: m,
    group: getGroupForModel(m)
  }));

  // Convert each model <M> that is not associated with a group <G> to it's row <R> form, and
  // establish a row group <RowGroup> to hold these rows that do not have an associated group <G>.
  const groupWithoutGroup: Table.RowGroup<R, M, G> = {
    group: null,
    rows: map(
      map(
        filter(modelsAndGroups, (m: { model: M; group: G | null }) => m.group === null) as { model: M; group: null }[],
        (obj: { model: M; group: null }) => obj.model
      ) as M[],
      (m: M) => ({
        model: m,
        row: rows.createModelRow<R, M>({
          columns: config.columns,
          model: m,
          gridId: "data",
          getRowChildren: config.getModelRowChildren,
          getRowLabel: config.getModelRowLabel,
          getRowName: config.getModelRowName
        })
      })
    )
  };

  const modelsWithGroup: { model: M; group: G }[] = filter(
    modelsAndGroups,
    (m: { model: M; group: G | null }) => m.group !== null
  ) as { model: M; group: G }[];

  const groupsWithGroup: Table.RowGroup<R, M, G>[] = reduce(
    groupBy(modelsWithGroup, (m: { model: M; group: G }) => m.group.id),
    (curr: Table.RowGroup<R, M, G>[], ms: { model: M; group: G }[], groupId: string) => {
      if (ms.length !== 0) {
        return [
          ...curr,
          {
            group: ms[0].group, // All of the objects in the array have the same group.
            rows: orderModelsWithRows(
              map(ms, (m: { model: M; group: G }) => ({
                model: m.model,
                row: rows.createModelRow<R, M>({
                  ...m,
                  columns: config.columns,
                  gridId: "data",
                  getRowChildren: config.getModelRowChildren,
                  getRowLabel: config.getModelRowLabel,
                  getRowName: config.getModelRowName
                })
              }))
            )
          }
        ];
      }
      return curr;
    },
    []
  );
  return [
    ...groupsWithGroup,
    {
      ...groupWithoutGroup,
      rows: orderModelsWithRows(groupWithoutGroup.rows)
    }
  ];
};

export const createTableRows = <R extends Table.RowData, M extends Model.Model, G extends Model.Group>(
  config: Table.CreateTableDataConfig<R, M, G> & {
    readonly gridId: Table.GridId;
  }
): Table.Row<R, M>[] => {
  const tableData: Table.TableData<R, M, G> = createTableData(config);
  return reduce(
    tableData,
    (rws: Table.Row<R, M>[], rowGroup: Table.RowGroup<R, M, G>) => {
      let newRows: Table.Row<R, M>[] = [...rws, ...map(rowGroup.rows, (row: Table.ModelWithRow<R, M>) => row.row)];
      if (!isNil(rowGroup.group)) {
        const groupRow: Table.GroupRow<R> | null = rows.createGroupRow<R, M, G>({
          columns: config.columns,
          group: rowGroup.group,
          getRowLabel: config.getGroupRowLabel,
          getRowName: config.getGroupRowName
        });
        if (!isNil(groupRow)) {
          newRows = [...newRows, groupRow];
        }
      }
      return newRows;
    },
    []
  );
};
