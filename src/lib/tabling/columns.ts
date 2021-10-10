import React from "react";
import { find, isNil, reduce, filter, orderBy } from "lodash";
import { Subtract } from "utility-types";
import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { util, model } from "lib";

import * as aggrid from "./aggrid";
import * as formatters from "./formatters";
import * as Models from "./models";
import * as typeguards from "./typeguards";

type InferLazyColumnArgs<C> = C extends Table.MaybeLazyColumn<any, any, any, any, infer ARGS> ? ARGS : never;

/* eslint-disable indent */
export const normalizedField = <
  R extends Table.RowData = any,
  M extends Model.HttpModel = any,
  V = any,
  PDFM extends Model.HttpModel = any,
  P extends { readonly field?: keyof R; readonly colId?: string } = Table.Column<R, M, V, PDFM>
>(
  col: P
): string | undefined => (col.field !== undefined ? (col.field as string) : col.colId);

export const Lazy =
  <
    D extends Table.Column<R, M, any, PDFM>,
    R extends Table.RowData = any,
    M extends Model.HttpModel = any,
    V = any,
    PDFM extends Model.HttpModel = any
  >(
    factory: Table.FactoryFn<D>
  ) =>
  (c: Partial<Table.Column<R, M, V, PDFM>>): Table.LazyColumn<R, M, V, PDFM, D> => {
    const id = normalizedField(c);
    if (isNil(id)) {
      throw new Error("Either the field or colId must be provided!");
    }
    return {
      id: id as keyof R | string,
      includeInPdf: c.includeInPdf || false,
      column: (c2: Subtract<D, Table.Column<R, M, any, PDFM>> & Partial<Table.Column<R, M, V, PDFM>>) =>
        factory({ ...c, ...c2 } as D & Partial<Table.Column<R, M, any, PDFM>>)
    };
  };

type ColumnTypeVariantOptions = {
  header?: boolean;
  pdf?: boolean;
};

export const getColumnTypeCSSStyle = (
  type: Table.ColumnTypeId | Table.ColumnType,
  options: ColumnTypeVariantOptions = { header: false, pdf: false }
): React.CSSProperties => {
  let colType: Table.ColumnType;
  if (typeof type === "string") {
    const ct: Table.ColumnType | undefined = find(Models.ColumnTypes, { id: type } as any);
    if (isNil(ct)) {
      return {};
    }
    colType = ct;
  } else {
    colType = type;
  }
  let style = colType.style || {};
  if (options.header === true && !isNil(colType.headerOverrides)) {
    style = { ...style, ...(colType.headerOverrides.style || {}) };
  }
  if (options.pdf === true && !isNil(colType.pdfOverrides)) {
    style = { ...style, ...(colType.pdfOverrides.style || {}) };
  }
  return style;
};

/* eslint-disable no-unused-vars */
/* eslint-disable indent */
type ColumnUpdates<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
> = {
  [key in keyof R | string]:
    | Partial<Table.Column<R, M, any, PDFM>>
    | ((c: Table.Column<R, M, any, PDFM>) => Partial<Table.Column<R, M, any, PDFM>>);
};

export const mergeColumns = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  columns: Table.Column<R, M, any, PDFM>[],
  updates: Partial<ColumnUpdates<R, M, PDFM>>
): Table.Column<R, M, any, PDFM>[] => {
  let key: keyof R | string;
  let merged: Table.Column<R, M, any, PDFM>[] = [...columns];
  for (key in updates) {
    const fieldUpdates:
      | Partial<Table.Column<R, M, any, PDFM>>
      | ((c: Table.Column<R, M, any, PDFM>) => Partial<Table.Column<R, M, any, PDFM>>)
      | undefined = updates[key];
    if (!isNil(fieldUpdates)) {
      merged = updateColumnsOfField<R, M, PDFM>(merged, key, fieldUpdates);
    }
  }
  return merged;
};

type ColumnUpdate<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any,
  D extends Partial<Table.Column<R, M, any, PDFM>> = Partial<Table.Column<R, M, any, PDFM>>
> = D | ((p: Table.Column<R, M, any, PDFM>) => D);

export const normalizeColumns = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  // TODO: Assuming any here for D can cause bugs - where the update might have fields in it that
  // are not allowed.  We should come up with a cleaner solution.
  columns: Table.MaybeLazyColumn<R, M, any, PDFM, any>[],
  updates?: {
    [key: string]: ColumnUpdate<R, M, PDFM, any>;
  }
): Table.Column<R, M, any, PDFM>[] => {
  const normalizedColumn = <C extends Table.MaybeLazyColumn<R, M, any, PDFM, any>>(
    c: C,
    data: InferLazyColumnArgs<C> = {} as InferLazyColumnArgs<C>
  ) => (typeguards.isLazyColumn(c) ? c.column(data) : c);

  return reduce(
    columns,
    (evaluated: Table.Column<R, M, any, PDFM>[], c: Table.MaybeLazyColumn<R, M, any, PDFM, any>) => {
      if (!isNil(updates)) {
        const id = typeguards.isLazyColumn(c) ? c.id : normalizedField(c);
        if (!isNil(id)) {
          type ARGS = InferLazyColumnArgs<typeof c>;
          const data: ColumnUpdate<R, M, PDFM, ARGS> | undefined = updates[id as string];
          if (data !== undefined) {
            const normalizedC = normalizedColumn(c);
            if (typeof data === "function") {
              return [...evaluated, { ...normalizedC, ...data(normalizedC) }];
            } else {
              return [...evaluated, normalizedColumn(c, data)];
            }
          }
        }
      }
      return [...evaluated, normalizedColumn(c)];
    },
    []
  );
};

export const updateColumnsOfTableType = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  columns: Table.Column<R, M, any, PDFM>[],
  type: Table.TableColumnTypeId,
  update:
    | Partial<Table.Column<R, M, any, PDFM>>
    | ((c: Table.Column<R, M, any, PDFM>) => Partial<Table.Column<R, M, any, PDFM>>)
): Table.Column<R, M, any, PDFM>[] => {
  return reduce(
    columns,
    (curr: Table.Column<R, M, any, PDFM>[], col: Table.Column<R, M, any, PDFM>) => {
      if (col.tableColumnType === type) {
        return [...curr, { ...col, ...(typeof update === "function" ? update(col) : update) }];
      }
      return [...curr, col];
    },
    []
  );
};

export const updateColumnsOfField = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  columns: Table.Column<R, M, any, PDFM>[],
  field: keyof R | string,
  update:
    | Partial<Table.Column<R, M, any, PDFM>>
    | ((c: Table.Column<R, M, any, PDFM>) => Partial<Table.Column<R, M, any, PDFM>>)
): Table.Column<R, M, any, PDFM>[] => {
  return reduce(
    columns,
    (curr: Table.Column<R, M, any, PDFM>[], col: Table.Column<R, M, any, PDFM>) => {
      if (col.field === field || col.colId === field) {
        return [...curr, { ...col, ...(typeof update === "function" ? update(col) : update) }];
      }
      return [...curr, col];
    },
    []
  );
};

export const orderColumns = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  columns: Table.Column<R, M, any, PDFM>[]
): Table.Column<R, M, any, PDFM>[] => {
  const actionColumns = filter(columns, (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "action");
  const calculatedColumns = filter(
    columns,
    (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "calculated"
  );
  const bodyColumns = filter(columns, (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "body");
  // It doesn't matter where the fake columns go in the ordering because they are not
  // displayed - all we care about is that they are present.
  const fakeColumns = filter(columns, (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "fake");

  const actionColumnsWithIndex = filter(actionColumns, (col: Table.Column<R, M, any, PDFM>) => !isNil(col.index));
  const actionColumnsWithoutIndex = filter(actionColumns, (col: Table.Column<R, M, any, PDFM>) => isNil(col.index));

  const calculatedColumnsWithIndex = filter(
    calculatedColumns,
    (col: Table.Column<R, M, any, PDFM>) => !isNil(col.index)
  );
  const calculatedColumnsWithoutIndex = filter(calculatedColumns, (col: Table.Column<R, M, any, PDFM>) =>
    isNil(col.index)
  );

  const bodyColumnsWithIndex = filter(bodyColumns, (col: Table.Column<R, M, any, PDFM>) => !isNil(col.index));
  const bodyColumnsWithoutIndex = filter(bodyColumns, (col: Table.Column<R, M, any, PDFM>) => isNil(col.index));

  return [
    ...fakeColumns,
    ...orderBy(actionColumnsWithIndex, ["index"], ["asc"]),
    ...actionColumnsWithoutIndex,
    ...orderBy(bodyColumnsWithIndex, ["index"], ["asc"]),
    ...bodyColumnsWithoutIndex,
    ...orderBy(calculatedColumnsWithIndex, ["index"], ["asc"]),
    ...calculatedColumnsWithoutIndex
  ];
};

/* eslint-disable indent */
export const ActionColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Partial<Table.Column<R, M, any>>
): Table.Column<R, M, any> => ({
  ...col,
  selectable: false,
  tableColumnType: "action",
  isRead: false,
  isWrite: false,
  headerName: "",
  editable: false,
  suppressSizeToFit: true,
  resizable: false,
  cellClass: aggrid.mergeClassNamesFn("cell--centered", "cell--action", col.cellClass),
  canBeHidden: false,
  canBeExported: false
});

export const FakeColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  col: Partial<Table.Column<R, M, any, PDFM>>
): Table.Column<R, M, any, PDFM> => ({
  ...col,
  tableColumnType: "fake"
});

export const LazyFakeColumn = Lazy(FakeColumn);

export const CalculatedColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  col: Partial<Table.Column<R, M, number, PDFM>>,
  width?: number
): Table.Column<R, M, number, PDFM> => {
  return {
    ...col,
    cellStyle: { textAlign: "right", ...col?.cellStyle },
    cellRenderer: "CalculatedCell",
    tableColumnType: "calculated",
    columnType: "sum",
    isRead: true,
    isWrite: false,
    suppressSizeToFit: true,
    width: !isNil(width) ? width : 100,
    // maxWidth: !isNil(width) ? width : 100,
    cellClass: aggrid.mergeClassNamesFn("cell--calculated", col?.cellClass),
    valueFormatter: formatters.currencyValueFormatter,
    cellRendererParams: {
      ...col?.cellRendererParams,
      renderRedIfNegative: true
    }
  };
};

export const LazyCalculatedColumn = Lazy(CalculatedColumn);

export const BodyColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  V = any,
  PDFM extends Model.HttpModel = any
>(
  col?: Partial<Table.Column<R, M, V, PDFM>>
): Table.Column<R, M, V, PDFM> => {
  return {
    ...col,
    tableColumnType: "body"
  };
};

export const LazyBodyColumn = Lazy(BodyColumn);

export const ExpandColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Partial<Table.Column<R, M, any>>,
  width?: number
): Table.Column<R, M, any> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: { data: "ExpandCell" },
    ...col,
    width: !isNil(width) ? width : 30,
    maxWidth: !isNil(width) ? width : 30,
    field: "expand" as keyof R & string
  });

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

// Abstract - not meant to be used by individual columns.  It just enforces that
// the clipboard processing props are provided.
export const SelectColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  V = any,
  PDFM extends Model.HttpModel = any
>(
  col: Partial<Table.Column<R, M, V, PDFM>>
): Table.Column<R, M, V, PDFM> => {
  return BodyColumn<R, M, V, PDFM>({
    columnType: "singleSelect",
    suppressSizeToFit: true,
    ...col,
    editorIsPopup: true,
    cellClass: aggrid.mergeClassNamesFn("cell--renders-html", col?.cellClass),
    // Required to allow the dropdown to be selectable on Enter key.
    suppressKeyboardEvent: !isNil(col?.suppressKeyboardEvent)
      ? col?.suppressKeyboardEvent
      : (params: SuppressKeyboardEventParams) => {
          if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
            return true;
          }
          return false;
        }
  });
};

export const LazySelectColumn = Lazy(SelectColumn);

export interface ModelSelectColumnProps<C extends Model.HttpModel = Model.HttpModel> {
  readonly models: C[];
  readonly modelClipboardValue: (m: C) => string;
  readonly processCellFromClipboard: (value: string) => number | null;
}

export const ModelSelectColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  C extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  col: ModelSelectColumnProps<C> & Partial<Table.Column<R, M, number | null, PDFM>>
): Table.Column<R, M, number | null, PDFM> => {
  const { models, modelClipboardValue, ...column } = col;
  return SelectColumn<R, M, number | null, PDFM>({
    processCellForClipboard:
      column.processCellForClipboard ??
      ((row: R) => {
        const field = col?.field || (col?.colId as keyof R);
        if (!isNil(field)) {
          const id = util.getKeyValue<R, keyof R>(field)(row);
          if (isNil(id)) {
            return "";
          }
          const m: C | undefined = find(models, { id } as any);
          return !isNil(m) ? modelClipboardValue(m) : "";
        }
        return "";
      }),
    ...column
  });
};

type LazyModelSelectColumnProps = ModelSelectColumnProps<any> & Table.Column<any, any, number | null, any>;
export const LazyModelSelectColumn = Lazy<LazyModelSelectColumnProps>(ModelSelectColumn);

export interface TagSelectColumnProps {
  readonly models: Model.Tag[];
}

export const TagSelectColumn: Table.FactoryFn<TagSelectColumnProps & Partial<Table.Column<any, any, Model.Tag, any>>> =
  <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, PDFM extends Model.HttpModel = any>(
    col: TagSelectColumnProps & Partial<Table.Column<R, M, Model.Tag, PDFM>>
  ): Table.Column<R, M, Model.Tag, PDFM> => {
    const { models, ...column } = col;
    return SelectColumn({
      processCellForClipboard: (row: R) => {
        const field = col?.field || (col?.colId as keyof R);
        if (!isNil(field)) {
          const m: Model.Tag | undefined = util.getKeyValue<R, keyof R>(field)(row) as any;
          return m?.title || "";
        }
        return "";
      },
      getHttpValue: (value: Model.Tag | null): ID | null => (!isNil(value) ? value.id : null),
      processCellFromClipboard: (name: string): Model.Tag | null =>
        // TODO: We might have to also consider the plural_title here.
        model.util.inferModelFromName<Model.Tag>(models, name, { nameField: "title" }),
      ...column
    });
  };

type LazyTagSelectColumnProps = TagSelectColumnProps & Table.Column<any, any, Model.Tag, any>;
export const LazyTagSelectColumn = Lazy<LazyTagSelectColumnProps>(TagSelectColumn);

export interface ChoiceSelectColumnProps<C extends Model.Choice<any, any> = Model.Choice<any, any>> {
  readonly models: C[];
}

export const ChoiceSelectColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  C extends Model.Choice<any, any> = Model.Choice<any, any>,
  PDFM extends Model.HttpModel = any
>(
  col: ChoiceSelectColumnProps<C> & Partial<Table.Column<R, M, C, PDFM>>
): Table.Column<R, M, C, PDFM> => {
  const { models, ...column } = col;
  return SelectColumn<R, M, C, PDFM>({
    getHttpValue: (value: C | null): ID | null => (!isNil(value) ? value.id : null),
    processCellForClipboard: (row: R) => {
      const field = col.field || (col.colId as keyof R);
      if (!isNil(field)) {
        const m: C | undefined = util.getKeyValue<R, keyof R>(field)(row) as any;
        return m?.name || "";
      }
      return "";
    },
    processCellFromClipboard: (name: string) => model.util.findChoiceForName<C>(models, name),
    ...column
  });
};

type LazyChoiceSelectColumnProps = ChoiceSelectColumnProps & Table.Column<any, any, Model.Choice<any, any>, any>;
export const LazyChoiceSelectColumn = Lazy<LazyChoiceSelectColumnProps>(ChoiceSelectColumn);
