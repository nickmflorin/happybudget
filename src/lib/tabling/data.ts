import { includes, reduce, filter, map, isNil, findIndex, orderBy } from "lodash";

import { tabling } from "lib";

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
  let modelsWithoutGroups: A[] = [];

  const groupId = (obj: C) => (tabling.typeguards.isRow(obj) ? tabling.managers.groupId(obj.id) : obj.id);

  const modelGroup = (obj: A): C | null => {
    const groupsForModel: C[] | undefined = filter(config.groups, (g: C) => includes(g.children, obj.id));
    if (groupsForModel.length > 1) {
      console.error(`Corrupted Data: Model ${obj.id} is associated with multiple groups!`);
    }
    return groupsForModel.length === 0 ? null : groupsForModel[0];
  };

  const modelIndex = (obj: A): number =>
    tabling.typeguards.isRow(obj)
      ? obj.originalIndex
      : Math.max(
          findIndex(config.current, (mi: A) => mi.id === obj.id),
          0
        );

  type ModelsAndGroup = { models: A[]; group: C };

  const grouped = reduce(
    config.current,
    (curr: ModelsAndGroup[], m: A): ModelsAndGroup[] => {
      const group = modelGroup(m);
      if (!isNil(group)) {
        const index = findIndex(curr, (mg: ModelsAndGroup) => groupId(mg.group) === groupId(group));
        if (index === -1) {
          return [...curr, { models: [m], group }];
        } else {
          return [
            ...curr.slice(0, index),
            { ...curr[index], models: orderBy([...curr[index].models, m], modelIndex) },
            ...curr.slice(index + 1)
          ];
        }
      } else {
        modelsWithoutGroups = [...modelsWithoutGroups, m];
        return curr;
      }
    },
    []
  );

  return [
    ...reduce(
      // We want to order the groups by the model in it's set that occurs earliest in
      // the original data.
      orderBy(grouped, (mg: ModelsAndGroup) => Math.min(...map(mg.models, (m: A) => modelIndex(m)))),
      (curr: (A | C)[], mg: ModelsAndGroup) => {
        return [...curr, ...mg.models, mg.group];
      },
      []
    ),
    ...orderBy(modelsWithoutGroups, modelIndex),
    ...(config.markups || [])
  ];
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
  const modelRowManager = new tabling.managers.ModelRowManager<R, M>({
    getRowChildren: config.getModelRowChildren,
    columns: config.columns
  });
  const groupRowManager = new tabling.managers.GroupRowManager<R, M>({ columns: config.columns });
  const markupRowManager = new tabling.managers.MarkupRowManager<R, M>({ columns: config.columns });
  return orderTableRows([
    ...reduce(
      config.response.models,
      (curr: Table.ModelRow<R>[], m: M, index: number) => [
        ...curr,
        modelRowManager.create({ originalIndex: index, model: m })
      ],
      []
    ),
    ...reduce(
      config.response.groups === undefined ? [] : config.response.groups,
      (curr: Table.GroupRow<R>[], g: Model.Group) => [...curr, groupRowManager.create({ model: g })],
      []
    ),
    ...reduce(
      config.response.markups === undefined ? [] : config.response.markups,
      (curr: Table.MarkupRow<R>[], mk: Model.Markup) => [...curr, markupRowManager.create({ model: mk })],
      []
    )
  ]);
};
