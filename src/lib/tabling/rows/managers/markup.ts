import { isNil, filter, includes } from "lodash";

import { tabling, budgeting } from "lib";

import BodyRowManager from "./body";

type CreateMarkupRowConfig = {
  readonly model: Model.Markup;
};

type MarkupRowManagerConfig<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly columns: Table.Column<R, M>[];
};

class MarkupRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends BodyRowManager<Table.MarkupRow<R>, R, M> {
  constructor(config: MarkupRowManagerConfig<R, M>) {
    super({ ...config, rowType: "markup" });
  }

  getValueForRow<V extends Table.RawRowValue, C extends Table.ModelColumn<R, M, V>>(
    col: C,
    markup: Model.Markup
  ): [V | undefined, boolean] {
    // The FakeColumn(s) are not applicable for Markups.
    if (tabling.columns.isDataColumn<R, M>(col) && !isNil(col.markupField)) {
      return [markup[col.markupField] as V | undefined, true];
    }
    /* We want to indicate that the value is nnot applicable for the column so
		 	 that it is not included in the row data and a warning is not issued when
			 the value is undefined */
    return [undefined, false];
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
          id: tabling.rows.markupRowId(config.model.id)
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
