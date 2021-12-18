import { isNil, map, findIndex, includes, filter } from "lodash";
import { SuppressKeyboardEventParams, CellClassParams } from "@ag-grid-community/core";

import { util, tabling, budgeting } from "lib";

export const ActionColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  col: Partial<Table.Column<R, M>>
): Table.Column<R, M> => ({
  ...col,
  selectable: false,
  tableColumnType: "action",
  isRead: false,
  isWrite: false,
  headerName: "",
  editable: false,
  suppressSizeToFit: true,
  resizable: false,
  cellClass: tabling.aggrid.mergeClassNamesFn("cell--action", col.cellClass),
  canBeHidden: false,
  canBeExported: false
});

export const FakeColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  col: Partial<Table.Column<R, M>>
): Table.Column<R, M> => ({
  ...col,
  canBeHidden: false,
  tableColumnType: "fake"
});

export const CalculatedColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  col: Partial<Table.Column<R, M, number>>,
  width?: number
): Table.Column<R, M, number> => {
  return {
    ...col,
    cellStyle: { textAlign: "right", ...col?.cellStyle },
    /* We do not want to use the cell renderers for the body cells because it
       slows rendering down dramatically. */
    cellRenderer: {
      footer: "CalculatedCell",
      page: "CalculatedCell"
    },
    nullValue: 0.0,
    tableColumnType: "calculated",
    columnType: "sum",
    isRead: true,
    isWrite: false,
    suppressSizeToFit: true,
    width: !isNil(width) ? width : 100,
    cellClass: (params: CellClassParams) => {
      if (!isNaN(parseFloat(params.value)) && parseFloat(params.value) < 0.0) {
        return tabling.aggrid.mergeClassNamesFn("cell--calculated", "negative", col?.cellClass)(params);
      }
      return tabling.aggrid.mergeClassNamesFn("cell--calculated", col?.cellClass)(params);
    },
    valueFormatter: tabling.formatters.currencyValueFormatter
  };
};

export const AttachmentsColumn = <
  R extends Tables.ActualRowData | Tables.SubAccountRowData | Tables.ContactRowData,
  M extends Model.RowHttpModel
>(
  col: Partial<Table.Column<R, M, Model.SimpleAttachment[]>>,
  width?: number
): Table.Column<R, M, Model.SimpleAttachment[]> => {
  return {
    ...col,
    headerName: "Attachments",
    editable: true,
    requiresAuthentication: true,
    cellRenderer: { data: "AttachmentsCell" },
    cellEditor: "NullCellEditor",
    tableColumnType: "body",
    columnType: "file",
    /* We want to make the attachments cell full size for purposes of dragging
       and dropping media - and we add the padding inside of the cell itself. */
    cellClass: "cell--full-size",
    isRead: true,
    isWrite: true,
    nullValue: [],
    width: !isNil(width) ? width : 140,
    getHttpValue: (value: Model.SimpleAttachment[]) => map(value, (m: Model.SimpleAttachment) => m.id)
  };
};

export const BodyColumn = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
>(
  col?: Partial<Table.Column<R, M, V>>
): Table.Column<R, M, V> => {
  return {
    ...col,
    tableColumnType: "body"
  };
};

export const DragColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  col: Partial<Table.Column<R, M>>,
  width?: number
): Table.Column<R, M> =>
  ActionColumn({
    ...col,
    colId: "drag",
    cellClass: ["cell--renders-html", "cell--drag"],
    cellRenderer: { data: "DragCell" },
    width: !isNil(width) ? width : 10,
    maxWidth: !isNil(width) ? width : 10
  }) as Table.Column<R, M>;

export const EditColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  col: Partial<Table.Column<R, M>>,
  width?: number
): Table.Column<R, M> =>
  ActionColumn({
    cellRenderer: { data: "EditCell" },
    ...col,
    width: !isNil(width) ? width : 30,
    maxWidth: !isNil(width) ? width : 30,
    colId: "edit"
  });

export const CheckboxColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  col: Partial<Table.Column<R, M>>,
  hasEditColumn: boolean,
  width?: number
): Table.Column<R, M> =>
  ActionColumn({
    cellRenderer: "EmptyCell",
    ...col,
    colId: "checkbox",
    width: !isNil(width) ? width : hasEditColumn === false ? 40 : 25,
    maxWidth: !isNil(width) ? width : hasEditColumn === false ? 40 : 25,
    footer: {
      /* We always want the entire new row icon in the footer cell to be present,
         but the column itself isn't always wide enough. */
      cellStyle: {
        zIndex: 1000,
        overflow: "visible",
        whiteSpace: "unset",
        textAlign: "left",
        paddingLeft: 0,
        paddingRight: 0
      }
    }
  }) as Table.Column<R, M>;

/* Abstract - not meant to be used by individual columns.  It just enforces that
   the clipboard processing props are provided. */
export const SelectColumn = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
>(
  col: Partial<Table.Column<R, M, V>>
): Table.Column<R, M, V> => {
  return BodyColumn<R, M, V>({
    columnType: "singleSelect",
    suppressSizeToFit: true,
    ...col,
    cellEditorPopup: true,
    cellEditorPopupPosition: "below",
    cellClass: tabling.aggrid.mergeClassNamesFn("cell--renders-html", col?.cellClass),
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

export const TagSelectColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  col: Partial<Table.Column<R, M, Model.Tag>>
): Table.Column<R, M, Model.Tag> => {
  return SelectColumn({
    processCellForClipboard: (row: R) => {
      const field = col?.field || (col?.colId as keyof R);
      if (!isNil(field)) {
        const m: Model.Tag | undefined = util.getKeyValue<R, keyof R>(field)(row) as unknown as Model.Tag | undefined;
        return m?.title || "";
      }
      return "";
    },
    getHttpValue: (value: Model.Tag | null): ID | null => (!isNil(value) ? value.id : null),
    ...col
  });
};
export const ChoiceSelectColumn = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  C extends Model.Choice<number, string> | null = Model.Choice<number, string> | null
>(
  col: Partial<Table.Column<R, M, C>>
): Table.Column<R, M, C> => {
  return SelectColumn<R, M, C>({
    getHttpValue: (value: C | null): ID | null => (!isNil(value) ? value.id : null),
    processCellForClipboard: (row: R) => {
      const field = col.field || (col.colId as keyof R);
      if (!isNil(field)) {
        const m: C | undefined = util.getKeyValue<R, keyof R>(field)(row) as unknown as C | undefined;
        return m?.name || "";
      }
      return "";
    },
    ...col
  });
};

export const IdentifierColumn = <
  T extends "account" | "subaccount",
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel<T>
>(
  props: Partial<Table.Column<R, M, string | null>>
): Table.Column<R, M, string | null> => {
  return BodyColumn<R, M, string | null>({
    columnType: "number",
    smartInference: true,
    ...props,
    footer: {
      /* We always want the text in the identifier cell to be present, but the
			   column itself isn't always wide enough.  However, applying a colSpan
				 conflicts with the colSpan of the main data grid, causing weird
				 behavior. */
      cellStyle: { zIndex: 1000, overflow: "visible", whiteSpace: "unset", textAlign: "left" }
    },
    page: {
      /* We always want the text in the identifier cell to be present, but the
			   column itself isn't always wide enough.  However, applying a colSpan
				 conflicts with the colSpan of the main data grid, causing weird
				 behavior. */
      cellStyle: { zIndex: 1000, overflow: "visible", whiteSpace: "unset", textAlign: "left" }
    },
    index: 0,
    /* We only want to use IdentifierCell's in the Footer cells because it slows
		   rendering performance down dramatically. */
    cellRenderer: { footer: "IdentifierCell", page: "IdentifierCell" },
    width: 100,
    suppressSizeToFit: true,
    cellStyle: { textAlign: "left" },
    valueGetter: (row: Table.BodyRow<R>) => {
      if (tabling.typeguards.isGroupRow(row)) {
        return row.groupData.name;
      }
      return row.data.identifier;
    },
    colSpan: (params: Table.ColSpanParams<R, M>) => {
      const row: Table.BodyRow<R> = params.data;
      if (tabling.typeguards.isGroupRow(row)) {
        /*
        Note: We have to look at all of the visible columns that are present up
				until the calculated columns.  This means we have to use the AG Grid
				ColumnApi (not our own columns).
        */
        const agColumns: Table.AgColumn[] | undefined = params.columnApi?.getAllDisplayedColumns();
        if (!isNil(agColumns)) {
          const originalCalculatedColumns = map(
            filter(params.columns, (c: Table.Column<R, M>) => c.tableColumnType === "calculated"),
            (c: Table.Column<R, M>) => tabling.columns.normalizedField<R, M>(c)
          );
          const indexOfIdentifierColumn = findIndex(agColumns, (c: Table.AgColumn) => c.getColId() === "identifier");
          const indexOfFirstCalculatedColumn = findIndex(agColumns, (c: Table.AgColumn) =>
            includes(originalCalculatedColumns, c.getColId())
          );
          return indexOfFirstCalculatedColumn - indexOfIdentifierColumn;
        }
      }
      return 1;
    }
  });
};

export const EstimatedColumn = <R extends Tables.BudgetRowData, M extends Model.RowHttpModel>(
  props: Partial<Table.Column<R, M, number>>
): Table.Column<R, M, number> => {
  return CalculatedColumn<R, M>({
    ...props,
    headerName: "Estimated",
    valueGetter: budgeting.valueGetters.estimatedValueGetter
  });
};

export const ActualColumn = <R extends Tables.BudgetRowData, M extends Model.RowHttpModel>(
  props: Partial<Table.Column<R, M, number>>
): Table.Column<R, M, number> => {
  return CalculatedColumn<R, M>({
    ...props,
    headerName: "Actual",
    valueGetter: budgeting.valueGetters.actualValueGetter
  });
};

export const VarianceColumn = <R extends Tables.BudgetRowData, M extends Model.RowHttpModel>(
  props: Partial<Table.Column<R, M, number>>
): Table.Column<R, M, number> => {
  return CalculatedColumn<R, M>({
    ...props,
    headerName: "Variance",
    valueGetter: budgeting.valueGetters.varianceValueGetter
  });
};
