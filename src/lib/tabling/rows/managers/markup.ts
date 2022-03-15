import { isNil, filter, includes } from "lodash";

import * as budgeting from "../../../budgeting";
import * as columns from "../../columns";
import * as ids from "../ids";

import BodyRowManager, { BodyRowManagerConfig, FieldNotApplicableForRow } from "./base";

type CreateMarkupRowConfig = {
  readonly model: Model.Markup;
};

class MarkupRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends BodyRowManager<Table.MarkupRow<R>, R, M, [Model.Markup]> {
  constructor(config: Omit<BodyRowManagerConfig<Table.MarkupRow<R>, R, M>, "rowType">) {
    super({ ...config, rowType: "markup" });
  }

  getValueForRow<V extends Table.RawRowValue, C extends Table.ModelColumn<R, M, V>>(
    col: C,
    markup: Model.Markup
  ): V | undefined {
    // The FakeColumn(s) are not applicable for Markups.
    if (columns.isDataColumn<R, M>(col) && !isNil(col.markupField)) {
      return markup[col.markupField] as V | undefined;
    }
    /* We need to indicate that the value is not applicable for the column for
       this GroupRow, otherwise a warning will be issued and the value will be
       set to the column's `nullValue`. */
    throw new FieldNotApplicableForRow();
  }

  removeChildren(row: Table.MarkupRow<R>, Ids: SingleOrArray<number>): Table.MarkupRow<R> {
    const IDs: number[] = Array.isArray(Ids) ? Ids : [Ids];
    return {
      ...row,
      children: filter(row.children, (child: number) => !includes(IDs, child))
    };
  }

  create(config: CreateMarkupRowConfig): Table.MarkupRow<R> {
    return {
      ...this.createBasic(
        {
          ...config,
          id: ids.markupRowId(config.model.id)
        },
        config.model
      ),
      children: budgeting.typeguards.isPercentMarkup(config.model) ? config.model.children : [],
      markupData: {
        unit: config.model.unit,
        rate: config.model.rate
      }
    };
  }
}

export default MarkupRowManager;
