import { isNil, find } from "lodash";
import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { tabling, util, model } from "lib";

export const ActionColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>
): Partial<Table.Column<R, M>> => ({
  /* eslint-disable indent */
  ...col,
  selectable: false,
  columnType: "action",
  tableColumnType: "action",
  fieldBehavior: [],
  headerName: "",
  editable: false,
  resizable: false,
  cellClass: tabling.util.mergeClassNamesFn("cell--centered", "cell--action", col.cellClass),
  canBeHidden: false,
  canBeExported: false
});

export const CalculatedColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>,
  width?: number
): Table.Column<R, M> => {
  return {
    ...col,
    cellStyle: { textAlign: "right", ...col.cellStyle },
    cellRenderer: "CalculatedCell",
    tableColumnType: "calculated",
    columnType: "sum",
    fieldBehavior: ["read"],
    suppressSizeToFit: true,
    width: !isNil(width) ? width : 100,
    maxWidth: !isNil(width) ? width : 100,
    cellClass: tabling.util.mergeClassNamesFn("cell--calculated", col.cellClass),
    valueFormatter: tabling.formatters.agCurrencyValueFormatter,
    cellRendererParams: {
      ...col.cellRendererParams,
      renderRedIfNegative: true
    }
  } as Table.Column<R, M>;
};

export const BodyColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>
): Table.Column<R, M> => {
  return {
    cellRenderer: "BodyCell",
    ...col,
    tableColumnType: "body"
  } as Table.Column<R, M>;
};

export const ExpandColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>,
  width?: number
): Table.Column<R, M> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: "ExpandCell",
    ...col,
    width: !isNil(width) ? width : 30,
    maxWidth: !isNil(width) ? width : 30,
    field: "expand" as keyof M & keyof R & string
  }) as Table.Column<R, M>;

export const IndexColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>,
  hasExpandColumn: boolean,
  width?: number
): Table.Column<R, M> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: "EmptyCell",
    ...col,
    field: "index" as keyof M & keyof R & string,
    width: !isNil(width) ? width : hasExpandColumn === false ? 40 : 25,
    maxWidth: !isNil(width) ? width : hasExpandColumn === false ? 40 : 25
  }) as Table.Column<R, M>;

export interface SelectColumnProps<R extends Table.Row, M extends Model.Model>
  extends Omit<Table.Column<R, M>, "columnType" | "tableColumnType"> {
  readonly columnType?: Table.ColumnTypeId;
}

// Abstract - not meant to be used by individual columns.  It just enforces that
// the clipboard processing props are provided.
export const SelectColumn = <R extends Table.Row, M extends Model.Model>(
  props: SelectColumnProps<R, M>
): Table.Column<R, M> => {
  return BodyColumn({
    columnType: "singleSelect",
    width: 100,
    ...props,
    cellClass: tabling.util.mergeClassNamesFn("cell--renders-html", props.cellClass),
    // Required to allow the dropdown to be selectable on Enter key.
    suppressKeyboardEvent: !isNil(props.suppressKeyboardEvent)
      ? props.suppressKeyboardEvent
      : (params: SuppressKeyboardEventParams) => {
          if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
            return true;
          }
          return false;
        }
  });
};

export interface ModelSelectColumnProps<R extends Table.Row, M extends Model.Model, C extends Model.Model>
  extends SetOptional<SelectColumnProps<R, M>, "processCellForClipboard"> {
  readonly models: C[];
  readonly modelClipboardValue: (m: C) => string;
  readonly processCellFromClipboard: (value: string) => C | null;
}

export const ModelSelectColumn = <R extends Table.Row, M extends Model.Model, C extends Model.Model>(
  props: ModelSelectColumnProps<R, M, C>
): Table.Column<R, M> => {
  const { models, modelClipboardValue, ...column } = props;
  return SelectColumn({
    processCellForClipboard:
      column.processCellForClipboard ??
      ((row: R) => {
        const id = util.getKeyValue<R, keyof R>(props.field as string)(row);
        if (isNil(id)) {
          return "";
        }
        const m: C | undefined = find(models, { id } as any);
        return !isNil(m) ? modelClipboardValue(m) : "";
      }),
    ...column
  });
};

export interface TagSelectColumnProps<R extends Table.Row, M extends Model.Model>
  extends SetOptional<SelectColumnProps<R, M>, "processCellForClipboard"> {
  readonly models: Model.Tag[];
  readonly processCellFromClipboard?: (value: string) => Model.Tag | null;
}

export const TagSelectColumn = <R extends Table.Row, M extends Model.Model>(
  props: TagSelectColumnProps<R, M>
): Table.Column<R, M> => {
  const { models, ...column } = props;
  return SelectColumn({
    processCellForClipboard: (row: R) => {
      const m: Model.Tag | undefined = util.getKeyValue<R, keyof R>(props.field as string)(row);
      if (isNil(m)) {
        return "";
      }
      return m.title;
    },
    getHttpValue: (value: Model.Tag | null): number | null => (!isNil(value) ? value.id : null),
    processCellFromClipboard: (name: string) =>
      // TODO: We might have to also consider the plural_title here.
      model.util.inferModelFromName<Model.Tag>(models, name, { nameField: "title" }),
    ...column
  });
};

export interface ChoiceSelectColumnProps<R extends Table.Row, M extends Model.Model, C extends Model.Choice<any, any>>
  extends SetOptional<SelectColumnProps<R, M>, "processCellForClipboard"> {
  readonly models: C[];
  readonly processCellFromClipboard?: (value: string) => C | null;
}

export const ChoiceSelectColumn = <R extends Table.Row, M extends Model.Model, C extends Model.Choice<any, any>>(
  props: ChoiceSelectColumnProps<R, M, C>
): Table.Column<R, M> => {
  const { models, ...column } = props;
  return SelectColumn({
    getHttpValue: (value: C | null): number | null => (!isNil(value) ? value.id : null),
    processCellForClipboard: (row: R) => {
      const m: C | undefined = util.getKeyValue<R, keyof R>(props.field as string)(row);
      if (isNil(m)) {
        return "";
      }
      return m.name;
    },
    processCellFromClipboard: (name: string) => model.util.findChoiceForName<C>(models, name),
    ...column
  });
};
