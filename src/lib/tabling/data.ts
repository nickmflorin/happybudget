import { includes, reduce, filter, map, isNil } from "lodash";

import { tabling, util, model } from "lib";

type InjectMarkupsConfig<
  R extends Table.RowData,
  M extends Model.TypedHttpModel,
  A extends Table.DataRow<R, M> | M = M,
  B extends Model.Markup | Table.MarkupRow<R> = Model.Markup
> = {
  readonly current: A[];
  readonly markups: B[];
};

type InjectGroupsConfig<
  R extends Table.RowData,
  M extends Model.TypedHttpModel,
  A extends Table.DataRow<R, M> | M = M,
  B extends Model.Markup | Table.MarkupRow<R> = Model.Markup,
  C extends Model.Group | Table.GroupRow<R> = Model.Group
> = {
  readonly current: (A | B)[];
  readonly groups: C[];
};

/* eslint-disable indent */
export const injectGroups = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel,
  A extends Table.DataRow<R, M> | M = M,
  B extends Model.Markup | Table.MarkupRow<R> = Model.Markup,
  C extends Model.Group | Table.GroupRow<R> = Model.Group
>(
  config: InjectGroupsConfig<R, M, A, B, C>
): (A | B | C)[] => {
  let modelsAndMarkupsAndGroups: (A | B | C)[] = [];
  let modelsWithoutGroups: (A | B)[] = [];

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
  const markupId = (obj: B) => (tabling.typeguards.isRow(obj) ? obj.markup : obj.id);
  const groupId = (obj: C) => (tabling.typeguards.isRow(obj) ? obj.group : obj.id);
  const modelGroup = (obj: A | B): C | null => {
    const groupsForModel = filter(config.groups, (g: C) =>
      isB(obj) ? includes(g.children_markups, markupId(obj)) : includes(g.children, (obj as A).id)
    );
    if (groupsForModel.length > 1) {
      throw new Error("Corrupted table data!");
    }
    return groupsForModel.length === 0 ? null : groupsForModel[0];
  };
  const equalById = (obj1: A | B, obj2: A | B) => {
    if (isA(obj1) && isA(obj2)) {
      return obj1.id === obj2.id;
    } else if (isB(obj1) && isB(obj2)) {
      return markupId(obj1) === markupId(obj2);
    }
    return false;
  };

  for (let i = 0; i < config.current.length; i++) {
    let mdl: A | B = config.current[i];
    const allocatedModels: Table.DataRowId[] = map(
      filter(modelsAndMarkupsAndGroups, (obj: A | B | C) => isA(obj)) as A[],
      (obj: A) => obj.id
    );
    const allocatedMarkups: number[] = map(
      filter(modelsAndMarkupsAndGroups, (obj: A | B | C) => isB(obj)) as B[],
      (obj: B) => markupId(obj)
    );
    const allocatedGroups: number[] = map(
      filter(modelsAndMarkupsAndGroups, (obj: A | B | C) => isC(obj)) as C[],
      (obj: C) => groupId(obj)
    );

    const isAllocated = (mdli: A | B) =>
      isA(mdli) ? includes(allocatedModels, mdl.id) : includes(allocatedMarkups, markupId(mdli as B));

    if (!isAllocated(mdl)) {
      const groupForModel = modelGroup(mdl);
      if (isNil(groupForModel)) {
        modelsWithoutGroups = [...modelsWithoutGroups, mdl];
      } else {
        modelsAndMarkupsAndGroups = [...modelsAndMarkupsAndGroups, mdl];
        const otherModelsWithSameGroups: (A | B)[] = filter(config.current, (mi: A | B) => {
          if (!equalById(mi, mdl)) {
            const g = modelGroup(mi);
            return !isNil(g) ? groupId(g) === groupId(groupForModel) : false;
          }
          return false;
        });
        for (let j = 0; j < otherModelsWithSameGroups.length; j++) {
          const m: A | B = otherModelsWithSameGroups[j];
          if (!isAllocated(m)) {
            modelsAndMarkupsAndGroups = [...modelsAndMarkupsAndGroups, m];
          } else {
            // Not sure if this makes sense...
            throw new Error("Corrupted table data!");
          }
        }
        if (includes(allocatedGroups, groupId(groupForModel))) {
          throw new Error("Corrupted table data!");
        }
        modelsAndMarkupsAndGroups = [...modelsAndMarkupsAndGroups, groupForModel];
      }
    }
  }
  return [...modelsAndMarkupsAndGroups, ...modelsWithoutGroups];
};

/* eslint-disable indent */
export const injectMarkups = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel,
  A extends Table.DataRow<R, M> | M = M,
  B extends Model.Markup | Table.MarkupRow<R> = Model.Markup
>(
  config: InjectMarkupsConfig<R, M, A, B>
): (A | B)[] => {
  let modelsAndMarkups: (A | B)[] = [];
  let modelsWithoutMarkups: A[] = [];

  const isA = (obj: A | B): obj is A => {
    return (
      (tabling.typeguards.isRow(obj) && tabling.typeguards.isDataRow(obj)) ||
      (!tabling.typeguards.isRow(obj) && !model.typeguards.isMarkup(obj))
    );
  };
  const isB = (obj: A | B): obj is B => {
    return (
      (tabling.typeguards.isRow(obj) && tabling.typeguards.isMarkupRow(obj)) ||
      (!tabling.typeguards.isRow(obj) && model.typeguards.isMarkup(obj))
    );
  };
  const markupId = (obj: B) => (tabling.typeguards.isRow(obj) ? obj.markup : obj.id);

  for (let i = 0; i < config.current.length; i++) {
    const mdl: A = config.current[i];
    const allocatedModels: Table.DataRowId[] = map(
      filter(modelsAndMarkups, (obj: A | B) => isA(obj)) as A[],
      (obj: A) => obj.id
    );
    const allocatedMarkups: number[] = map(filter(modelsAndMarkups, (obj: A | B) => isB(obj)) as B[], (obj: B) =>
      markupId(obj)
    );
    if (!includes(allocatedModels, mdl.id)) {
      // TODO: Issue warning if markup cannot be found.
      const markupsForModel: B[] = filter(config.markups, (m: B) => includes(m.children, mdl.id)) as B[];
      if (markupsForModel.length !== 0) {
        modelsAndMarkups = [...modelsAndMarkups, mdl];
        const markupSet: Set<number> = new Set(map(markupsForModel, (mk: B) => markupId(mk)));
        const otherModelsWithSameMarkups = filter(config.current, (mi: A) => {
          if (mi.id !== mdl.id) {
            const markupsForOtherModel: B[] = filter(config.markups, (mk: B) => includes(mk.children, mi.id)) as B[];
            const otherMarkupSet = new Set(map(markupsForOtherModel, (mk: B) => markupId(mk)));
            return util.setsEqual(markupSet, otherMarkupSet);
          }
          return false;
        });
        for (let j = 0; j < otherModelsWithSameMarkups.length; j++) {
          const m = otherModelsWithSameMarkups[j];
          if (!includes(allocatedModels, m.id)) {
            modelsAndMarkups = [...modelsAndMarkups, m];
          } else {
            // Not sure if this makes sense...
            throw new Error("Corrupted table data!");
          }
        }
        for (let j = 0; j < markupsForModel.length; j++) {
          const mk = markupsForModel[j];
          // If the Markup was previously added, we have to remove it at it's first location
          // and move it down the array towards the bottom of the table - since it is now used
          // in more than 1 location.
          if (includes(allocatedMarkups, markupId(mk))) {
            modelsAndMarkups = filter(modelsAndMarkups, (obj: A | B) => {
              if (isB(obj)) {
                return markupId(obj) !== markupId(mk);
              }
              return true;
            });
          }
          modelsAndMarkups = [...modelsAndMarkups, mk];
        }
      } else {
        modelsWithoutMarkups = [...modelsWithoutMarkups, mdl];
      }
    }
  }
  return [...modelsAndMarkups, ...modelsWithoutMarkups];
};

export const orderTableRows = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  data: Table.Row<R, M>[]
): Table.Row<R, M>[] => {
  // The order of the actual data rows of the table dictate the order of everything else.
  const dataRows = filter(data, (r: Table.Row<R, M>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R, M>[];
  const markupRows = filter(data, (r: Table.Row<R, M>) => tabling.typeguards.isMarkupRow(r)) as Table.MarkupRow<R>[];
  const groupRows = filter(data, (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[];
  return injectGroups<R, M, Table.DataRow<R, M>, Table.MarkupRow<R>, Table.GroupRow<R>>({
    groups: groupRows,
    current: injectMarkups<R, M, Table.DataRow<R, M>, Table.MarkupRow<R>>({ current: dataRows, markups: markupRows })
  });
};

export const createTableRows = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  config: Table.CreateTableDataConfig<R, M>
): Table.Row<R, M>[] => {
  const models = config.response.models;
  const groups = config.response.groups === undefined ? [] : config.response.groups;
  const markups = config.response.markups === undefined ? [] : config.response.markups;

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

  let groupRows: Table.GroupRow<R>[] = reduce(
    groups,
    (curr: Table.GroupRow<R>[], g: Model.Group) => [
      ...curr,
      tabling.rows.createGroupRow<R, M>({
        columns: config.columns,
        group: g,
        childrenRows: filter(modelRows, (r: Table.ModelRow<R, M>) => includes(g.children, r.id))
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

  return orderTableRows([...modelRows, ...groupRows, ...markupRows]);
};
