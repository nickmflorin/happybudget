import { isNil, find } from "lodash";

import { tabling, util, model } from "lib";

export const ActionColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>
): Partial<Table.Column<R, M>> => ({
  /* eslint-disable indent */
  ...col,
  selectable: false,
  columnType: "action",
  fieldBehavior: [],
  headerName: "",
  editable: false,
  resizable: false,
  cellClass: tabling.util.mergeClassNamesFn("cell--centered", "cell--action", col.cellClass),
  canBeHidden: false,
  canBeExported: false
});

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

export const CalculatedColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>,
  width?: number
): Table.Column<R, M> => {
  return {
    ...col,
    cellStyle: { textAlign: "right", ...col.cellStyle },
    cellRenderer: "CalculatedCell",
    suppressSizeToFit: true,
    width: !isNil(width) ? width : 100,
    maxWidth: !isNil(width) ? width : 100,
    valueFormatter: tabling.formatters.agCurrencyValueFormatter,
    cellRendererParams: {
      ...col.cellRendererParams,
      renderRedIfNegative: true
    }
  } as Table.Column<R, M>;
};

interface SelectColumnProps<R extends Table.Row, M extends Model.Model, C extends Model.Model>
  extends Omit<Table.Column<R, M>, "columnType" | "processCellFromClipboard"> {
  readonly columnType?: Table.ColumnTypeId;
  readonly processCellFromClipboard: (value: string) => C | null;
}

const SelectColumn = <R extends Table.Row, M extends Model.Model, C extends Model.Model>(
  props: SelectColumnProps<R, M, C>
): Table.Column<R, M> => {
  return {
    columnType: "singleSelect",
    width: 100,
    ...props,
    cellClass: tabling.util.mergeClassNamesFn("cell--renders-html", props.cellClass)
  };
};

interface ModelSelectColumnProps<R extends Table.Row, M extends Model.Model, C extends Model.Model>
  extends SelectColumnProps<R, M, C> {
  readonly models: C[];
  readonly modelClipboardValue: (m: C) => string;
}

export const ModelSelectColumn = <R extends Table.Row, M extends Model.Model, C extends Model.Model>(
  props: ModelSelectColumnProps<R, M, C>
): Table.Column<R, M> => {
  const { models, modelClipboardValue, ...column } = props;
  return SelectColumn({
    processCellForClipboard: (row: R) => {
      const id = util.getKeyValue<R, keyof R>(props.field as string)(row);
      if (isNil(id)) {
        return "";
      }
      const m: C | undefined = find(models, { id } as any);
      return !isNil(m) ? modelClipboardValue(m) : "";
    },
    ...column
  });
};

interface TagSelectColumnProps<R extends Table.Row, M extends Model.Model>
  extends Omit<SelectColumnProps<R, M, Model.Tag>, "processCellFromClipboard"> {
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

interface ChoiceSelectColumnProps<R extends Table.Row, M extends Model.Model, C extends Model.Choice<any, any>>
  extends Omit<SelectColumnProps<R, M, Model.Tag>, "processCellFromClipboard"> {
  readonly models: C[];
  readonly processCellFromClipboard?: (value: string) => C | null;
}

export const ChoiceSelectColumn = <R extends Table.Row, M extends Model.Model, C extends Model.Choice<any, any>>(
  props: ChoiceSelectColumnProps<R, M, C>
): Table.Column<R, M> => {
  return SelectColumn({
    getHttpValue: (value: C | null): number | null => (!isNil(value) ? value.id : null),
    processCellForClipboard: (row: R) => {
      const m: C | undefined = util.getKeyValue<R, keyof R>(props.field as string)(row);
      if (isNil(m)) {
        return "";
      }
      return m.name;
    },
    processCellFromClipboard: (name: string) => model.util.findChoiceForName<C>(props.models, name),
    ...props
  });
};
