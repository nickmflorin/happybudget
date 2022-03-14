import { isNil, filter, includes } from "lodash";

import * as columns from "../../columns";
import * as ids from "../ids";

import BodyRowManager from "./body";

type CreateGroupRowConfig = {
  readonly model: Model.Group;
};

type GroupRowManagerConfig<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly columns: Table.Column<R, M>[];
};

class GroupRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends BodyRowManager<Table.GroupRow<R>, R, M> {
  constructor(config: GroupRowManagerConfig<R, M>) {
    super({ ...config, rowType: "group" });
  }

  getValueForRow<V extends Table.RawRowValue, C extends Table.ModelColumn<R, M, V>>(
    col: C,
    group: Model.Group
  ): [V | undefined, boolean] {
    // The FakeColumn(s) are not applicable for Groups.
    if (columns.isDataColumn<R, M>(col) && !isNil(col.groupField)) {
      return [group[col.groupField] as V, true];
    }
    /* We want to indicate that the value is not applicable for the column so
		 	 that it is not included in the row data and a warning is not issued when
			 the value is undefined */
    return [undefined, false];
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
          id: ids.groupRowId(config.model.id)
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
