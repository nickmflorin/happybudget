import { findIndex, orderBy } from "lodash";

import { store } from "application";
import { logger } from "internal";

import * as model from "../../model";
import * as columns from "../columns";
import { CellValue } from "../types";

import * as ids from "./ids";
import * as managers from "./managers";
import * as typeguards from "./typeguards";
import * as types from "./types";

type InjectMarkupsAndGroupsConfig<
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = {
  readonly current: types.RowSubType<R, types.DataRowType, N, T>[];
  readonly markups?: types.RowSubType<R, "markup", N, T>[];
  readonly groups?: types.RowSubType<R, "group", N, T>[];
};

export const injectMarkupsAndGroups = <
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  config: InjectMarkupsAndGroupsConfig<R, N, T>,
): (
  | types.RowSubType<R, types.DataRowType, N, T>
  | types.RowSubType<R, "markup", N, T>
  | types.RowSubType<R, "group", N, T>
)[] => {
  let modelsWithoutGroups: types.RowSubType<R, "model", N, T>[] = [];

  const modelGroup = (
    groups: types.RowSubType<R, "group", N, T>[],
    obj: types.RowSubType<R, "model", N, T>,
  ): types.RowSubType<R, "group", N, T> | null => {
    const groupsForModel: types.RowSubType<R, "group", N, T>[] | undefined = groups.filter(
      (g: types.RowSubType<R, "group", N, T>) => g.children.includes(obj.id),
    );
    if (groupsForModel.length > 1) {
      logger.error(
        {
          id: obj.id,
          type: obj.modelType,
          groups: JSON.stringify(
            groupsForModel.map((g: types.RowSubType<R, "group", N, T>) => g.id),
          ),
        },
        `Corrupted Data: Model ${obj.id} is associated with multiple groups!`,
      );
    }
    return groupsForModel.length === 0 ? null : groupsForModel[0];
  };

  type ModelsAndGroup = {
    models: types.RowSubType<R, "model", N, T>[];
    group: types.RowSubType<R, "group", N, T>;
  };

  /* Placeholders do not have an inherent ordering from the backend, yet...  They will not have this
     ordering until the response is received from the backend, so we need to collect them during the
     ordering process and put them at the end of the orders rows. */
  let placeholders: types.RowSubType<R, "placeholder", N, T>[] = [];

  const grouped = config.current.reduce(
    (curr: ModelsAndGroup[], m: types.RowSubType<R, types.DataRowType, N, T>): ModelsAndGroup[] => {
      if (typeguards.isModelRow(m)) {
        const group: types.RowSubType<R, "group", N, T> | null =
          config.groups !== undefined ? modelGroup(config.groups, m) : null;
        if (group !== null) {
          const index = findIndex(
            curr,
            (mg: ModelsAndGroup) => ids.groupId(mg.group.id) === ids.groupId(group.id),
          );
          if (index === -1) {
            return [...curr, { models: [m], group }];
          } else {
            return [
              ...curr.slice(0, index),
              { ...curr[index], models: orderBy([...curr[index].models, m], "order") },
              ...curr.slice(index + 1),
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
    [],
  );
  // We want to order the groups by the model in it's set that occurs earliest in the original data.
  return [
    ...orderBy(grouped, (mg: ModelsAndGroup) => mg.models[0].order).reduce(
      (
        curr: (types.RowSubType<R, "model", N, T> | types.RowSubType<R, "group", N, T>)[],
        mg: ModelsAndGroup,
      ) => [...curr, ...mg.models, mg.group],
      [],
    ),
    ...orderBy(modelsWithoutGroups, "order"),
    ...placeholders,
    ...(config.markups || []),
  ];
};

export const orderTableData = <
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  data: types.RowSubType<R, types.BodyRowType, N, T>[],
): types.RowSubType<R, types.BodyRowType, N, T>[] => {
  // The order of the actual data rows of the table dictate the order of everything else.
  const dataRows = data.filter((r: types.RowSubType<R, types.BodyRowType, N, T>) =>
    typeguards.isDataRow(r),
  ) as types.RowSubType<R, types.DataRowType, N, T>[];
  const markupRows = data.filter((r: types.RowSubType<R, types.BodyRowType, N, T>) =>
    typeguards.isMarkupRow(r),
  ) as types.RowSubType<R, "markup", N, T>[];
  const groupRows = data.filter((r: types.RowSubType<R, types.BodyRowType, N, T>) =>
    typeguards.isGroupRow(r),
  ) as types.RowSubType<R, "group", N, T>[];
  return injectMarkupsAndGroups<R, N, T>({
    groups: groupRows,
    current: dataRows,
    markups: markupRows,
  });
};

type CreateTableDataConfig<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = {
  readonly response: store.SuccessfulTableResponse<M>;
  readonly columns: columns.Columns<R, M, N, T>;
  readonly getModelRowChildren?: (m: M) => number[];
};

export const generateRowData = <
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  config: CreateTableDataConfig<R, M, N, T>,
): types.RowSubType<R, types.BodyRowType, N, T>[] => {
  const modelRowManager = new managers.ModelRowManager<R, M, N, T>({
    getRowChildren: config.getModelRowChildren,
    columns: config.columns,
  });
  const groupRowManager = new managers.GroupRowManager<R, M, N, T>({ columns: config.columns });
  const markupRowManager = new managers.MarkupRowManager<R, M, N, T>({ columns: config.columns });
  return orderTableData([
    ...config.response.models.reduce(
      (
        curr: types.ModelRow<types.GetRowData<R, N, T>>[],
        m: M,
      ): types.ModelRow<types.GetRowData<R, N, T>>[] => [
        ...curr,
        modelRowManager.create({ model: m }),
      ],
      [],
    ),
    ...(config.response.groups === undefined ? [] : config.response.groups).reduce(
      (curr: types.GroupRow<types.GetRowData<R, N, T>>[], g: model.Group) => [
        ...curr,
        groupRowManager.create({ model: g }),
      ],
      [],
    ),
    ...(config.response.markups === undefined ? [] : config.response.markups).reduce(
      (curr: types.MarkupRow<types.GetRowData<R, N, T>>[], mk: model.Markup) => [
        ...curr,
        markupRowManager.create({ model: mk }),
      ],
      [],
    ),
  ] as types.RowSubType<R, types.BodyRowType, N, T>[]);
};
