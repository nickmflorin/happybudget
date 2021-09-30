import { includes, reduce, filter, map, isNil, find } from "lodash";

import { tabling, model } from "lib";

type InjectMarkupsAndGroupsConfig<
  R extends Table.RowData,
  M extends Model.TypedHttpModel,
  A extends Table.DataRow<R> | M = M,
  B extends Model.Markup | Table.MarkupRow<R> = Model.Markup,
  C extends Model.Group | Table.GroupRow<R> = Model.Group
> = {
  readonly current: A[];
  readonly markups?: B[];
  readonly groups?: C[];
};

/* eslint-disable indent */
export const injectMarkupsAndGroups = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel,
  A extends Table.DataRow<R> | M = M,
  B extends Model.Markup | Table.MarkupRow<R> = Model.Markup,
  C extends Model.Group | Table.GroupRow<R> = Model.Group
>(
  config: InjectMarkupsAndGroupsConfig<R, M, A, B, C>
): (A | B | C)[] => {
  let data: (A | B | C)[] = [];
  let modelsWithoutGroups: A[] = [];

  const isA = (obj: A | B | C): obj is A => {
    return (
      (tabling.typeguards.isRow(obj) && tabling.typeguards.isDataRow(obj)) ||
      (!tabling.typeguards.isRow(obj) && !model.typeguards.isMarkup(obj))
    );
  };
  const isB = (obj: A | B | C): obj is B => {
    return (
      (tabling.typeguards.isRow(obj) && tabling.typeguards.isMarkupRow(obj)) ||
      (!tabling.typeguards.isRow(obj) && model.typeguards.isMarkup(obj))
    );
  };
  const isC = (obj: A | B | C): obj is C => {
    return (
      (tabling.typeguards.isRow(obj) && tabling.typeguards.isGroupRow(obj)) ||
      (!tabling.typeguards.isRow(obj) && model.typeguards.isGroup(obj))
    );
  };

  const markupId = (obj: B) => (tabling.typeguards.isRow(obj) ? tabling.rows.markupId(obj.id) : obj.id);
  const groupId = (obj: C) => (tabling.typeguards.isRow(obj) ? tabling.rows.groupId(obj.id) : obj.id);

  const modelGroup = (obj: A): C | null => {
    const groupsForModel: C | undefined = find(config.groups, (g: C) => includes(g.children, obj.id));
    return groupsForModel === undefined ? null : groupsForModel;
  };

  const isAllocated = (mdli: A | B | C) =>
    isA(mdli)
      ? includes(
          map(filter(data, (obj: A | B | C) => isA(obj)) as A[], (obj: A) => obj.id),
          mdli.id
        )
      : isB(mdli)
      ? includes(
          map(filter(data, (obj: A | B | C) => isB(obj)) as B[], (obj: B) => markupId(obj)),
          markupId(mdli as B)
        )
      : includes(
          map(filter(data, (obj: A | B | C) => isC(obj)) as C[], (obj: C) => groupId(obj)),
          groupId(mdli as C)
        );

  const allocateGroup = (g: C) => {
    if (isAllocated(g)) {
      data = filter(data, (m: A | B | C) => !(isC(m) && groupId(m) === groupId(g)));
    }
    data = [...data, g];
  };

  for (let i = 0; i < config.current.length; i++) {
    let mdl: A = config.current[i];

    if (!isAllocated(mdl)) {
      const g = modelGroup(mdl);
      if (isNil(g)) {
        modelsWithoutGroups = [...modelsWithoutGroups, mdl];
      } else {
        data = [...data, mdl];
        allocateGroup(g);
      }
    }
  }
  return [...data, ...modelsWithoutGroups, ...(config.markups || [])];
};

export const orderTableRows = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  data: Table.BodyRow<R>[]
): Table.BodyRow<R>[] => {
  // The order of the actual data rows of the table dictate the order of everything else.
  const dataRows = filter(data, (r: Table.BodyRow<R>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R>[];
  const markupRows = filter(data, (r: Table.BodyRow<R>) => tabling.typeguards.isMarkupRow(r)) as Table.MarkupRow<R>[];
  const groupRows = filter(data, (r: Table.BodyRow<R>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[];
  return injectMarkupsAndGroups<R, M, Table.DataRow<R>, Table.MarkupRow<R>, Table.GroupRow<R>>({
    groups: groupRows,
    current: dataRows,
    markups: markupRows
  });
};

export const createTableRows = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  config: Table.CreateTableDataConfig<R, M>
): Table.BodyRow<R>[] => {
  const models = config.response.models;
  const groups = config.response.groups === undefined ? [] : config.response.groups;
  const markups = config.response.markups === undefined ? [] : config.response.markups;
  const modelRows: Table.ModelRow<R>[] = reduce(
    models,
    (curr: Table.ModelRow<R>[], m: M) => [
      ...curr,
      tabling.rows.createModelRow<R, M>({
        model: m,
        columns: config.columns,
        getRowChildren: config.getModelRowChildren
      })
    ],
    []
  );

  const markupRows: Table.MarkupRow<R>[] = reduce(
    markups,
    (curr: Table.MarkupRow<R>[], mk: Model.Markup) => [
      ...curr,
      tabling.rows.createMarkupRow<R, M>({
        model: mk,
        columns: config.columns,
        childrenRows: filter(modelRows, (r: Table.ModelRow<R>) => includes(mk.children, r.id))
      })
    ],
    []
  );

  const groupRows: Table.GroupRow<R>[] = reduce(
    groups,
    (curr: Table.GroupRow<R>[], g: Model.Group) => [
      ...curr,
      tabling.rows.createGroupRow<R, M>({
        columns: config.columns,
        model: g,
        childrenRows: filter(modelRows, (r: Table.ModelRow<R>) => includes(g.children, r.id))
      })
    ],
    []
  );

  return orderTableRows([...modelRows, ...groupRows, ...markupRows]);
};
