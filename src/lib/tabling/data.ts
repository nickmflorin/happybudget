import { includes, reduce, filter, isNil, findIndex, orderBy } from "lodash";

import { tabling } from "lib";

type InjectMarkupsAndGroupsConfig<R extends Table.RowData> = {
  readonly current: Table.DataRow<R>[];
  readonly markups?: Table.MarkupRow<R>[];
  readonly groups?: Table.GroupRow<R>[];
};

/* eslint-disable indent */
export const injectMarkupsAndGroups = <R extends Table.RowData>(
  config: InjectMarkupsAndGroupsConfig<R>
): (Table.DataRow<R> | Table.MarkupRow<R> | Table.GroupRow<R>)[] => {
  let modelsWithoutGroups: Table.ModelRow<R>[] = [];

  const modelGroup = (obj: Table.ModelRow<R>): Table.GroupRow<R> | null => {
    const groupsForModel: Table.GroupRow<R>[] | undefined = filter(config.groups, (g: Table.GroupRow<R>) =>
      includes(g.children, obj.id)
    );
    if (groupsForModel.length > 1) {
      console.error(`Corrupted Data: Model ${obj.id} is associated with multiple groups!`);
    }
    return groupsForModel.length === 0 ? null : groupsForModel[0];
  };

  type ModelsAndGroup = { models: Table.ModelRow<R>[]; group: Table.GroupRow<R> };

  // Placeholders do not have an inherent ordering from the backend, yet...
  // They will not have this ordering until the response is received from the
  // backend, so we need to collect them during the ordering process and put
  // them at the end of the orders rows.
  let placeholders: Table.PlaceholderRow<R>[] = [];

  const grouped = reduce(
    config.current,
    (curr: ModelsAndGroup[], m: Table.DataRow<R>): ModelsAndGroup[] => {
      if (tabling.typeguards.isModelRow(m)) {
        const group = modelGroup(m);
        if (!isNil(group)) {
          const index = findIndex(
            curr,
            (mg: ModelsAndGroup) => tabling.managers.groupId(mg.group.id) === tabling.managers.groupId(group.id)
          );
          if (index === -1) {
            return [...curr, { models: [m], group }];
          } else {
            return [
              ...curr.slice(0, index),
              { ...curr[index], models: orderBy([...curr[index].models, m], "order") },
              ...curr.slice(index + 1)
            ];
          }
        } else {
          modelsWithoutGroups = [...modelsWithoutGroups, m];
          return curr;
        }
      } else {
        placeholders = [...placeholders, m];
        return curr;
      }
    },
    []
  );
  return [
    ...reduce(
      // We want to order the groups by the model in it's set that occurs earliest in
      // the original data.
      orderBy(grouped, (mg: ModelsAndGroup) => mg.models[0].order),
      (curr: (Table.ModelRow<R> | Table.GroupRow<R>)[], mg: ModelsAndGroup) => {
        return [...curr, ...mg.models, mg.group];
      },
      []
    ),
    ...orderBy(modelsWithoutGroups, "order"),
    ...placeholders,
    ...(config.markups || [])
  ];
};

export const orderTableRows = <R extends Table.RowData>(data: Table.BodyRow<R>[]): Table.BodyRow<R>[] => {
  // The order of the actual data rows of the table dictate the order of everything else.
  const dataRows = filter(data, (r: Table.BodyRow<R>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R>[];
  const markupRows = filter(data, (r: Table.BodyRow<R>) => tabling.typeguards.isMarkupRow(r)) as Table.MarkupRow<R>[];
  const groupRows = filter(data, (r: Table.BodyRow<R>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[];
  return injectMarkupsAndGroups<R>({
    groups: groupRows,
    current: dataRows,
    markups: markupRows
  });
};

export const createTableRows = <R extends Table.RowData, M extends Model.RowHttpModel>(
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
      (curr: Table.ModelRow<R>[], m: M, index: number) => [...curr, modelRowManager.create({ model: m })],
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
