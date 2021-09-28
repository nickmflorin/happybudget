import { includes, reduce, filter, map, isNil, find } from "lodash";

import { tabling, model } from "lib";

type InjectMarkupsAndGroupsConfig<
  R extends Table.RowData,
  M extends Model.TypedHttpModel,
  A extends Table.DataRow<R, M> | M = M,
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
  A extends Table.DataRow<R, M> | M = M,
  B extends Model.Markup | Table.MarkupRow<R> = Model.Markup,
  C extends Model.Group | Table.GroupRow<R> = Model.Group
>(
  config: InjectMarkupsAndGroupsConfig<R, M, A, B, C>
): (A | B | C)[] => {
  let data: (A | B | C)[] = [];
  let modelsWithoutGroupsOrMarkups: A[] = [];

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
  // Note: This only works right now because we are not using markups outside of the budget table context.
  // It should be removed when things become more stable as it is mostly a debugging help and it introduces
  // a type inconsistency around the markup row.
  const markupName = (obj: B): string | null =>
    tabling.typeguards.isRow(obj)
      ? (obj as Table.MarkupRow<{ identifier: string | null; description: string | null }>).data.identifier ||
        (obj as Table.MarkupRow<{ identifier: string | null; description: string | null }>).data.description
      : obj.identifier || obj.description;
  const markupRef = (obj: B): string => {
    const id = markupId(obj);
    const name = markupName(obj);
    if (!isNil(name)) {
      return `Markup ${name} (id = ${id})`;
    }
    return `Markup (id = ${id})`;
  };
  const groupId = (obj: C) => (tabling.typeguards.isRow(obj) ? tabling.rows.groupId(obj.id) : obj.id);
  const groupName = (obj: C) => (tabling.typeguards.isRow(obj) ? obj.groupData.name : obj.name);
  const groupRef = (obj: C) => `Group ${groupName(obj)} (id = ${groupId(obj)})`;

  const modelGroup = (obj: A | B): C | null => {
    const groupsForModel = filter(config.groups, (g: C) =>
      isB(obj) ? includes(g.children_markups, markupId(obj)) : includes(g.children, (obj as A).id)
    );
    if (groupsForModel.length > 1) {
      throw new Error("Corrupted table data!");
    }
    return groupsForModel.length === 0 ? null : groupsForModel[0];
  };

  const modelMarkups = (obj: A): B[] => filter(config.markups, (m: B) => includes(m.children, obj.id)) as B[];

  for (let i = 0; i < config.current.length; i++) {
    let mdl: A = config.current[i];

    const allocatedModels: Table.DataRowId[] = map(
      filter(data, (obj: A | B | C) => isA(obj)) as A[],
      (obj: A) => obj.id
    );
    const allocatedMarkups: number[] = map(filter(data, (obj: A | B | C) => isB(obj)) as B[], (obj: B) =>
      markupId(obj)
    );
    const allocatedGroups: number[] = map(filter(data, (obj: A | B | C) => isC(obj)) as C[], (obj: C) => groupId(obj));

    const isAllocated = (mdli: A | B | C) =>
      isA(mdli)
        ? includes(allocatedModels, mdl.id)
        : isB(mdli)
        ? includes(allocatedMarkups, markupId(mdli as B))
        : includes(allocatedGroups, groupId(mdli as C));

    const allocateMarkup = (mk: B, dat: (A | B | C)[]) => {
      // If the Markup was previously added, we have to remove it at it's first location
      // and move it down the array towards the bottom of the table - since it is now used
      // in more than 1 location.
      if (isAllocated(mk)) {
        dat = filter(dat, (obj: A | B | C) => !(isB(obj) && markupId(obj) === markupId(mk)));
      }
      return [...dat, mk];
    };

    const allocateGroup = (g: C, dat: (A | B | C)[]) => {
      if (isAllocated(g)) {
        dat = filter(dat, (m: A | B | C) => !(isC(m) && groupId(m) === groupId(g)));
      }
      return [...dat, g];
    };

    if (!isAllocated(mdl)) {
      const g = modelGroup(mdl);
      const markups = modelMarkups(mdl);

      if (isNil(g) && markups.length === 0) {
        modelsWithoutGroupsOrMarkups = [...modelsWithoutGroupsOrMarkups, mdl];
      } else {
        data = [...data, mdl];
        if (!isNil(g) && markups.length === 0) {
          data = allocateGroup(g, data);
        } else if (isNil(g) && markups.length !== 0) {
          for (let j = 0; j < markups.length; j++) {
            const mk = markups[j];
            data = allocateMarkup(mk, data);
          }
        } else if (!isNil(g) && markups.length !== 0) {
          if (g.children_markups.length !== 0) {
            for (let j = 0; j < g.children_markups.length; j++) {
              const id = g.children_markups[j];
              const mk = find(config.markups, (mki: B) => markupId(mki) === id);
              if (isNil(mk)) {
                /* eslint-disable no-console */
                console.error(
                  `${groupRef(g)} references markup ${id} as a child but it could not be found in the data.`
                );
              } else {
                data = allocateMarkup(mk, data);
              }
            }
          }
          data = allocateGroup(g, data);
          const leftoverMarkups = filter(markups, (mk: B) => !includes(g.children_markups, markupId(mk)));
          for (let j = 0; j < leftoverMarkups.length; j++) {
            const mk = markups[j];
            data = allocateMarkup(mk, data);
          }
        }
      }
    }
  }
  return [...data, ...modelsWithoutGroupsOrMarkups];
};

export const orderTableRows = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  data: Table.Row<R, M>[]
): Table.Row<R, M>[] => {
  // The order of the actual data rows of the table dictate the order of everything else.
  const dataRows = filter(data, (r: Table.Row<R, M>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R, M>[];
  const markupRows = filter(data, (r: Table.Row<R, M>) => tabling.typeguards.isMarkupRow(r)) as Table.MarkupRow<R>[];
  const groupRows = filter(data, (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[];
  return injectMarkupsAndGroups<R, M, Table.DataRow<R, M>, Table.MarkupRow<R>, Table.GroupRow<R>>({
    groups: groupRows,
    current: dataRows,
    markups: markupRows
  });
};

export const createTableRows = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  config: Table.CreateTableDataConfig<R, M>
): Table.Row<R, M>[] => {
  const models = config.response.models;
  const groups = config.response.groups === undefined ? [] : config.response.groups;
  const markups = config.response.markups === undefined ? [] : config.response.markups;
  console.log({ models, groups, markups });
  const modelRows: Table.ModelRow<R, M>[] = reduce(
    models,
    (curr: Table.ModelRow<R, M>[], m: M) => [
      ...curr,
      tabling.rows.createModelRow<R, M>({
        model: m,
        columns: config.columns,
        gridId: config.gridId,
        getRowChildren: config.getModelRowChildren
      })
    ],
    []
  );

  let markupRows: Table.MarkupRow<R>[] = reduce(
    markups,
    (curr: Table.MarkupRow<R>[], mk: Model.Markup) => [
      ...curr,
      tabling.rows.createMarkupRow<R, M>({
        markup: mk,
        columns: config.columns,
        childrenRows: filter(modelRows, (r: Table.ModelRow<R, M>) => includes(mk.children, r.id))
      })
    ],
    []
  );

  let groupRows: Table.GroupRow<R>[] = reduce(
    groups,
    (curr: Table.GroupRow<R>[], g: Model.Group) => [
      ...curr,
      tabling.rows.createGroupRow<R, M>({
        columns: config.columns,
        group: g,
        childrenRows: filter([...modelRows, ...markupRows], (r: Table.ModelRow<R, M> | Table.MarkupRow<R>) =>
          tabling.typeguards.isModelRow(r)
            ? includes(g.children, r.id)
            : includes(g.children_markups, tabling.rows.markupId(r.id))
        )
      })
    ],
    []
  );

  return orderTableRows([...modelRows, ...groupRows, ...markupRows]);
};
