import { isNil, find } from "lodash";
import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { tabling, util, model } from "lib";

/* eslint-disable indent */
export const Column = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>(
  col: Partial<Table.Column<R, M, V>>
): Table.Column<R, M, V> =>
  ({
    ...col,
    domain: "aggrid"
  } as Table.Column<R, M, V>);

export const ActionColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Partial<Table.Column<R, M>>
): Partial<Table.Column<R, M>> =>
  Column({
    ...col,
    selectable: false,
    tableColumnType: "action",
    isRead: false,
    isWrite: false,
    headerName: "",
    editable: false,
    suppressSizeToFit: true,
    resizable: false,
    cellClass: tabling.aggrid.mergeClassNamesFn("cell--centered", "cell--action", col.cellClass),
    canBeHidden: false,
    canBeExported: false
  });

export const FakeColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Partial<Table.Column<R, M>>
): Table.Column<R, M> =>
  Column({
    ...col,
    tableColumnType: "fake"
  });

export const CalculatedColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>(
  col: Partial<Table.Column<R, M, V>>,
  width?: number
): Table.Column<R, M, V> => {
  return Column<R, M, V>({
    ...col,
    cellStyle: { textAlign: "right", ...col.cellStyle },
    cellRenderer: "CalculatedCell",
    tableColumnType: "calculated",
    columnType: "sum",
    isRead: true,
    isWrite: false,
    suppressSizeToFit: true,
    width: !isNil(width) ? width : 100,
    // maxWidth: !isNil(width) ? width : 100,
    cellClass: tabling.aggrid.mergeClassNamesFn("cell--calculated", col.cellClass),
    valueFormatter: tabling.formatters.currencyValueFormatter,
    cellRendererParams: {
      ...col.cellRendererParams,
      renderRedIfNegative: true
    }
  });
};

export const BodyColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>(
  col: Partial<Table.Column<R, M, V>>
): Table.Column<R, M, V> => {
  return Column<R, M, V>({
    ...col,
    tableColumnType: "body"
  });
};

export const ExpandColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Partial<Table.Column<R, M>>,
  width?: number
): Table.Column<R, M> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: { data: "ExpandCell" },
    ...col,
    width: !isNil(width) ? width : 30,
    maxWidth: !isNil(width) ? width : 30,
    field: "expand" as keyof R & string
  }) as Table.Column<R, M>;

export const IndexColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Partial<Table.Column<R, M>>,
  hasExpandColumn: boolean,
  width?: number
): Table.Column<R, M> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: "EmptyCell",
    ...col,
    field: "index" as keyof R,
    width: !isNil(width) ? width : hasExpandColumn === false ? 40 : 25,
    maxWidth: !isNil(width) ? width : hasExpandColumn === false ? 40 : 25
  }) as Table.Column<R, M>;

export interface SelectColumnProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>
  extends Omit<Table.Column<R, M, V>, "columnType" | "tableColumnType" | "domain"> {
  readonly columnType?: Table.ColumnTypeId;
}

// Abstract - not meant to be used by individual columns.  It just enforces that
// the clipboard processing props are provided.
export const SelectColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>(
  props: SelectColumnProps<R, M, V>
): Table.Column<R, M, V> => {
  return BodyColumn<R, M, V>({
    columnType: "singleSelect",
    suppressSizeToFit: true,
    ...props,
    cellClass: tabling.aggrid.mergeClassNamesFn("cell--renders-html", props.cellClass),
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

export interface UnauthenticatedModelSelectColumnProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  C extends Model.HttpModel = Model.HttpModel
> extends SetOptional<SelectColumnProps<R, M, C>, "processCellForClipboard"> {
  readonly models: C[];
  readonly modelClipboardValue: (m: C) => string;
}

export const UnauthenticatedModelSelectColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  C extends Model.HttpModel = Model.HttpModel
>(
  props: UnauthenticatedModelSelectColumnProps<R, M, C>
): Table.Column<R, M> => {
  const { models, modelClipboardValue, ...column } = props;
  return SelectColumn<R, M, C>({
    processCellForClipboard:
      column.processCellForClipboard ??
      ((row: R) => {
        const id = util.getKeyValue<R, keyof R>(props.field as keyof R)(row);
        if (isNil(id)) {
          return "";
        }
        const m: C | undefined = find(models, { id } as any);
        return !isNil(m) ? modelClipboardValue(m) : "";
      }),
    ...column
  });
};

export interface ModelSelectColumnProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  C extends Model.HttpModel = Model.HttpModel
> extends UnauthenticatedModelSelectColumnProps<R, M, C> {
  readonly processCellFromClipboard: (value: string) => C | null;
}

export const ModelSelectColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  C extends Model.HttpModel = Model.HttpModel
>(
  props: ModelSelectColumnProps<R, M, C>
): Table.Column<R, M> => {
  return UnauthenticatedModelSelectColumn(props);
};

export interface TagSelectColumnProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>
  extends SetOptional<SelectColumnProps<R, M, Model.Tag>, "processCellForClipboard"> {
  readonly models: Model.Tag[];
  readonly processCellFromClipboard?: (value: string) => Model.Tag | null;
}

export const TagSelectColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: TagSelectColumnProps<R, M>
): Table.Column<R, M, Model.Tag> => {
  const { models, ...column } = props;
  return SelectColumn({
    processCellForClipboard: (row: R) => {
      const m: Model.Tag | undefined = util.getKeyValue<R, keyof R>(props.field as keyof R)(row) as any;
      if (isNil(m)) {
        return "";
      }
      return m.title;
    },
    getHttpValue: (value: Model.Tag | null): ID | null => (!isNil(value) ? value.id : null),
    processCellFromClipboard: (name: string): Model.Tag | null =>
      // TODO: We might have to also consider the plural_title here.
      model.util.inferModelFromName<Model.Tag>(models, name, { nameField: "title" }),
    ...column
  });
};

export interface ChoiceSelectColumnProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  C extends Model.Choice<any, any> = Model.Choice<any, any>
> extends SetOptional<SelectColumnProps<R, M, C>, "processCellForClipboard"> {
  readonly models: C[];
  readonly processCellFromClipboard?: (value: string) => C | null;
}

export const ChoiceSelectColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  C extends Model.Choice<any, any> = Model.Choice<any, any>
>(
  props: ChoiceSelectColumnProps<R, M, C>
): Table.Column<R, M> => {
  const { models, ...column } = props;
  return SelectColumn({
    getHttpValue: (value: C | null): ID | null => (!isNil(value) ? value.id : null),
    processCellForClipboard: (row: R) => {
      const m: C | undefined = util.getKeyValue<R, keyof R>(props.field as keyof R)(row) as any;
      if (isNil(m)) {
        return "";
      }
      return m.name;
    },
    processCellFromClipboard: (name: string) => model.util.findChoiceForName<C>(models, name),
    ...column
  });
};
