import { isNil, filter, includes } from "lodash";

import { tabling } from "lib";

import BodyRowManager, { BodyRowManagerConfig } from "./base";

type CreateGroupRowConfig = {
  readonly model: Model.Group;
};

class GroupRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends BodyRowManager<Table.GroupRow<R>, R, M, [Model.Group]> {
  constructor(config: Omit<BodyRowManagerConfig<Table.GroupRow<R>, R, M>, "rowType">) {
    super({ ...config, rowType: "group" });
  }

  getValueForRow<V extends Table.RawRowValue, C extends Table.ModelColumn<R, M, V>>(
    col: C,
    group: Model.Group
  ): V | undefined {
    // The FakeColumn(s) are not applicable for Groups.
    if (tabling.columns.isDataColumn<R, M>(col) && !isNil(col.groupField)) {
      return group[col.groupField] as V;
    }
    /* We need to indicate that the value is not applicable for the column for
       this GroupRow, otherwise a warning will be issued and the value will be
       set to the column's `nullValue`. */
    this.throwNotApplicable();
  }

  removeChildren(row: Table.GroupRow<R>, Ids: SingleOrArray<number>): Table.GroupRow<R> {
    const IDs: number[] = Array.isArray(Ids) ? Ids : [Ids];
    return {
      ...row,
      children: filter(row.children, (child: number) => !includes(IDs, child))
    };
  }

  create(config: CreateGroupRowConfig): Table.GroupRow<R> {
    return {
      ...this.createBasic(
        {
          ...config,
          id: tabling.rows.groupRowId(config.model.id)
        },
        config.model
      ),
      children: config.model.children,
      groupData: {
        name: config.model.name,
        color: config.model.color
      }
    };
  }
}

export default GroupRowManager;
