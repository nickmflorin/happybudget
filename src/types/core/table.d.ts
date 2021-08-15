/// <reference path="./modeling.d.ts" />
/// <reference path="./ui.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Table {

  type NullValue = null | "" | 0 | [];
  type ValueFormatter = (params: import("@ag-grid-community/core").ValueFormatterParams) => string | number | null;

  interface PageAndSize {
    readonly page: number;
    readonly pageSize: number;
  }

  type FieldBehavior = "read" | "write";
  type Field<R extends Table.Row, M extends Model.Model> = Omit<keyof R & keyof M & string, "id">;

  type GridApi = import("@ag-grid-community/core").GridApi;
  type ColumnApi = import("@ag-grid-community/core").ColumnApi;
  type GridApis = {
    readonly grid: Table.GridApi;
    readonly column: Table.ColumnApi;
  };
  type GridId = "data" | "footer" | "page";
  type GridSet<T> = { [key in GridId]: T };
  type TableApiSet = GridSet<GridApis | null>;
  type TableOptionsSet = GridSet<import("@ag-grid-community/core").GridOptions>;

  type FrameworkGroup = { [key: string]: React.ComponentType<any> };
  type GridFramework = {
    readonly editors?: Table.FrameworkGroup;
    readonly cells?: Table.FrameworkGroup;
  }
  type Framework = {
    readonly editors?: Table.FrameworkGroup;
    readonly cells?: Partial<Table.GridSet<Table.FrameworkGroup>>;
  }

  interface ITableApis {
    readonly store: Partial<Table.TableApiSet>;
    readonly get: (id: ID) => Table.GridApis | null;
    readonly set: (id: ID, apis: Table.GridApis) => void;
    readonly clone: () => ITableApis;
    readonly gridApis: Table.GridApi[];
  }

  interface RowMeta {
    readonly label?: string | number | null;
    readonly gridId: Table.GridId;
  };

  interface Row extends Record<string, any> {
    readonly id: number;
    readonly meta: RowMeta;
  }

  // TODO: Attach to Row Model? ^^
  interface RowColorDefinition {
    readonly backgroundColor?: string;
    readonly color?: string;
  }

  type ModelWithRow<R extends Table.Row, M extends Model.Model> = {
    readonly row: R;
    readonly model: M;
  }

  type TableData<R extends Table.Row, M extends Model.Model> = Table.ModelWithRow<R, M>[];

  type ColumnTypeId =
    | "text"
    | "longText"
    | "singleSelect"
    | "phoneNumber"
    | "email"
    | "number"
    | "phone"
    | "contact"
    | "currency"
    | "sum"
    | "percentage"
    | "date"
    | "action";

  type ColumnAlignment = "right" | "left" | null;

  interface ColumnType {
    readonly id: Table.ColumnTypeId;
    readonly style?: React.CSSProperties;
    readonly icon?: any;
    readonly editorIsPopup?: boolean;
    readonly pdfOverrides?: Omit<Partial<Table.ColumnType>, "id" | "editorIsPopup">;
    readonly headerOverrides?: Omit<Partial<Table.ColumnType>, "id" | "editorIsPopup" | "icon" | "pdfOverrides">;
  }

  type SelectableCallbackParams<R extends Table.Row, M extends Model.Mode> = {
    readonly row: R;
    readonly column: Table.Column<R, M>;
  }

  type EditableCallbackParams<R extends Table.Row, M extends Model.Mode> = {
    readonly row: R;
    readonly column: Table.Column<R, M>;
  }

  type RawClassName = string | string[] | undefined | { [key: string]: boolean };
  type ClassNameParamCallback<T> = (params: T) => Table.RawClassName;
  interface _CellClassNameArray<P> {
    [n: number]: RawClassName | ClassNameParamCallback<P> | _CellClassName<P>;
  };
  type ClassName<P> = RawClassName | ClassNameParamCallback<P> | _CellClassNameArray<P>;

  type CellClassName = Table.ClassName<import("@ag-grid-community/core").CellClassParams>;
  type RowClassName = Table.ClassName<import("@ag-grid-community/core").RowClassParams>;

  type ColSpanParams<R extends Table.Row, M extends Model.Model> = import("@ag-grid-community/core").ColSpanParams & {
    readonly columns: Table.Column<R, M>[];
  }

  // Column Type for Both PDF and AG Grid Tables
  interface DualColumn<R extends Table.Row, M extends Model.Model, V = any> {
    readonly field: Table.Field<R, M>;
    readonly headerName: string;
    readonly columnType: Table.ColumnTypeId;
    readonly nullValue?: Table.NullValue;
    readonly index?: number;
    readonly isCalculated?: boolean;
    readonly getRowValue?: (m: M) => R[keyof R];
  }

  type OmitColDefParams = "field" | "headerName" | "cellRenderer" | "cellClass" | "getCellClass" | "colSpan";
  interface Column<R extends Table.Row, M extends Model.Model, V = any> extends Omit<import("@ag-grid-community/core").ColDef, OmitColDefParams>, Table.DualColumn<R, M, V> {
    readonly selectable?: boolean | ((params: Table.SelectableCallbackParams<R, M>) => boolean) | undefined;
    readonly editable?: boolean | ((params: Table.EditableCallbackParams<R, M>) => boolean) | undefined;
    readonly fieldBehavior?: Table.FieldBehavior[]; // Defaults to ["read", "write"]
    readonly footer?: Table.FooterColumn<R, M>;
    readonly page?: Table.FooterColumn<R, M>;
    readonly cellRenderer?: string | Partial<Table.GridSet<string>>;
    readonly cellClass?: Table.CellClassName;
    readonly isCalculating?: boolean;
    readonly canBeHidden?: boolean;
    readonly canBeExported?: boolean;
    readonly colSpan?: (params: Table.ColSpanParams<R, M>) => number;
    readonly onCellFocus?: (params: CellFocusedParams<R, M>) => void;
    readonly onCellUnfocus?: (params: CellFocusedParams<R, M>) => void;
    readonly refreshColumns?: (change: Table.CellChange<R, M>) => Field<R, M> | Field<R, M>[] | null;
    readonly getModelValue?: (row: R) => M[keyof M];
    readonly getHttpValue?: (value: V) => any;
    readonly processCellForClipboard?: (row: R) => string;
    readonly processCellFromClipboard?: (value: string) => any;
  }

  interface FooterColumn<R extends Table.Row, M extends Model.Model> extends Pick<Table.Column<R, M>, "selectable" | "editable" | "colSpan"> {
    readonly value?: any;
    readonly cellRenderer?: string;
  }

  interface CookieNames {
    readonly ordering?: string;
    readonly hiddenColumns?: string;
  }

  interface Grid<R extends Table.Row, M extends Model.Model> {
    applyTableChange: (event: Table.ChangeEvent<R, M>) => void;
    getCSVData: (fields?: string[]) => CSVData;
  }
  /* eslint-disable no-shadow */
  type Table<R extends Table.Row, M extends Model.Model> = Table.Grid<R, M> & {
    changeColumnVisibility: (changes: SingleOrArray<Table.ColumnVisibilityChange<R, M>>, sizeToFit?: boolean) => void;
  };
  type GridRef<R extends Table.Row, M extends Model.Model> = { current: Table.Grid<R, M> };
  type Ref<R extends Table.Row, M extends Model.Model> = { current: Table.Table<R, M> };

  type MenuAction = {
    readonly icon: import("@fortawesome/fontawesome-svg-core").IconProp;
    readonly tooltip?: Partial<import("antd/lib/tooltip").TooltipPropsWithTitle> | string;
    // If being wrapped in a Dropdown, the onClick prop will not be used.
    readonly onClick?: () => void;
    readonly disabled?: boolean;
    readonly text?: string;
    readonly wrapInDropdown?: (children: ReactNode) => JSX.Element;
    readonly render?: RenderFunc;
  }

  interface MenuActionParams<R extends Table.Row, M extends Model.Model> {
    readonly apis: Table.GridApis;
    readonly columns: Table.Column<R, M>[];
    readonly selectedRows: R[];
    readonly hiddenColumns: Table.Field<R, M>[];
  }

  interface ColumnVisibilityChange<R extends Table.Row, M extends Model.Model> {
    readonly field: Table.Field<R, M>;
    readonly visible: boolean;
  }

  type Cell<R extends Table.Row, M extends Model.Model> = {
    readonly row: R;
    readonly column: Table.Column<R, M>;
    readonly rowNode: import("@ag-grid-community/core").RowNode;
  }

  type CellFocusedParams<R extends Table.Row, M extends Model.Model> = {
    readonly cell: Table.Cell<R, M>;
    readonly apis: APIs;
  }

  type CellFocusChangedParams<R extends Table.Row, M extends Model.Model> = {
    readonly cell: Table.Cell<R, M>;
    readonly previousCell: Table.Cell<R, M> | null;
    readonly apis: APIs;
  }

  type ChangeEventId = "dataChange" | "rowAdd" | "rowDelete" | "rowRemoveFromGroup" | "rowAddToGroup" | "groupDelete";

  type BaseChangeEvent = {
    readonly type: ChangeEventId;
  }

  type CellChange<R extends Table.Row, M extends Model.Model, V = any> = {
    readonly oldValue: V;
    readonly newValue: V;
    readonly field: Table.Field<R, M>;
    readonly column: Table.Column<R, M, V>;
    readonly row: R;
    readonly id: number;
  };

  type NestedCellChange<R extends Table.Row, M extends Model.Model, V = any> = Omit<Table.CellChange<R, M, V>, "field" | "id">;
  type CellAdd<R extends Table.Row, M extends Model.Model, V = any> = {
    readonly value: V;
    readonly field: Table.Field<R, M>;
    readonly column: Table.Column<R, M, V>;
  };
  type NestedCellAdd<R extends Table.Row, M extends Model.Model, V = any> = Omit<Table.CellAdd<R, M, V>, "field">;

  type RowChangeData<R extends Table.Row, M extends Model.Model> = {
    readonly [key in Table.Field<R, M>]?: Table.NestedCellChange<R, M>;
  };

  type RowChange<R extends Table.Row, M extends Model.Model> = {
    readonly id: number;
    readonly data: Table.RowChangeData<R, M>;
  };

  type RowAddData<R extends Table.Row, M extends Model.Model> = {
    readonly [key in Table.Field<R, M>]?: Table.NestedCellAdd<R, M>;
  };

  type RowAdd<R extends Table.Row, M extends Model.Model> = {
    readonly data: Table.RowAddData<R, M>;
  }

  type Change<R extends Table.Row, M extends Model.Model, V = any> =
    | Table.RowChange<R, M>
    | Table.CellChange<R, M, V>
    | (Table.CellChange<R, M, V> | Table.RowChange<R, M>)[];

  type ConsolidatedChange<R extends Table.Row, M extends Model.Model> = Table.RowChange<R, M>[];

  type DataChangeEvent<R extends Table.Row, M extends Model.Model> = Table.BaseChangeEvent & {
    readonly type: "dataChange";
    readonly payload: Table.Change<R, M>
  }

  type RowAddPayload<R extends Table.Row, M extends Model.Model> = number | Table.RowAdd<R, M> | Table.RowAdd<R, M>[];
  type RowAddEvent<R extends Table.Row, M extends Model.Model> = Table.BaseChangeEvent & {
    readonly type: "rowAdd";
    readonly payload: Table.RowAddPayload<R, M>;
  }

  type FullRowPayload<R extends Table.Row, M extends Model.Model> = {columns: Table.Column<R, M>[], rows: R | R[]};
  type BaseFullRowEvent<R extends Table.Row, M extends Model.Model> = Table.BaseChangeEvent & {
    readonly payload: Table.FullRowPayload<R, M>;
  }

  type RowDeletePayload<R extends Table.Row, M extends Model.Model> = Table.FullRowPayload<R, M>;
  type RowDeleteEvent<R extends Table.Row, M extends Model.Model> = Table.BaseFullRowEvent<R, M> & {
    readonly type: "rowDelete";
  }

  type RowRemoveFromGroupPayload<R extends Table.Row, M extends Model.Model> = Table.FullRowPayload<R, M> & { group: number };
  type RowRemoveFromGroupEvent<R extends Table.Row, M extends Model.Model> = Table.BaseFullRowEvent<R, M> & {
    readonly type: "rowRemoveFromGroup";
    readonly payload: Table.RowRemoveFromGroupPayload<R, M>;
  }

  type RowAddToGroupPayload<R extends Table.Row, M extends Model.Model> = Table.FullRowPayload<R, M> & { group: number };
  type RowAddToGroupEvent<R extends Table.Row, M extends Model.Model> = Table.BaseFullRowEvent<R, M> & {
    readonly type: "rowAddToGroup";
    readonly payload: Table.RowAddToGroupPayload<R, M>;
  }

  type GroupDeletePayload = number;
  type GroupDeleteEvent = Table.BaseChangeEvent & {
    readonly type: "groupDelete";
    readonly payload: GroupDeletePayload;
  }

  type FullRowEvent<R extends Table.Row, M extends Model.Model> = RowDeleteEvent<R, M> | RowRemoveFromGroupEvent<R, M> | RowAddToGroupEvent<R, M>;
  type GrouplessEvent<R extends Table.Row, M extends Model.Model> =
    | Table.DataChangeEvent<R, M>
    | Table.RowAddEvent<R, M>
    | Table.RowDeleteEvent<R, M>;
  type GroupEvent<R extends Table.Row, M extends Model.Model> =
  | Table.RowRemoveFromGroupEvent<R, M>
  | Table.RowAddToGroupEvent<R, M>
  | Table.GroupDeleteEvent;

  type OnChangeEvent<R extends Table.Row, M extends Model.Model> = (event: Table.ChangeEvent<R, M>) => void;
  type ChangeEvent<R extends Table.Row, M extends Model.Model> = GrouplessEvent<R, M> | GroupEvent<R, M>;

  interface CellPositionMoveOptions {
    readonly startEdit?: boolean;
  }

  type CellDoneEditingEvent =
    | import("react").SyntheticEvent
    | KeyboardEvent;

  // I really don't know why, but extending import("@ag-grid-community/core").IEditorParams
  // does not work here.
  interface EditorParams<R extends Table.Row, M extends Model.Model, V = any> {
    readonly value: any;
    readonly keyPress: number | null;
    readonly charPress: string | null;
    readonly column: Table.Column<R, M, V>;
    readonly columns: Table.Column<R, M, V>[];
    readonly colDef: import("@ag-grid-community/core").ColDef;
    readonly node: import("@ag-grid-community/core").RowNode;
    readonly data: any;
    readonly rowIndex: number;
    readonly api: import("@ag-grid-community/core").GridApi | null | undefined;
    readonly columnApi: import("@ag-grid-community/core").ColumnApi | null | undefined;
    readonly cellStartedEdit: boolean;
    readonly context: any;
    readonly onKeyDown: (event: KeyboardEvent) => void;
    readonly stopEditing: (suppressNavigateAfterEdit?: boolean) => void;
    readonly eGridCell: HTMLElement;
    readonly parseValue: (value: any) => any;
    readonly formatValue: (value: any) => any;
    // When the cell editor finishes editing, the AG Grid callback (onCellDoneEditing)
    // does not have any context about what event triggered the completion, so we have
    // to handle that ourselves so we can trigger different behaviors depending on
    // how the selection was performed.
    readonly onDoneEditing: (e: Table.CellDoneEditingEvent) => void;
  }

  interface CellProps<R extends Table.Row, M extends Model.Model, V = any>
    extends Omit<import("@ag-grid-community/core").ICellRendererParams, "value">,
      StandardComponentProps {
    readonly onClear?: (row: R, column: Table.Column<R, M>) => void;
    readonly showClear?: (row: R, column: Table.Column<R, M>) => boolean;
    readonly onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    readonly loading?: boolean;
    readonly hideClear?: boolean;
    readonly customCol: Table.Column<R, M>;
    readonly value: V;
    readonly onChangeEvent?: (event: Table.ChangeEvent<R, M>) => void;
  }

  type CellWithChildrenProps<R extends Table.Row, M extends Model.Model> = Omit<CellProps<R, M>, "value"> & {
    readonly children: import("react").ReactNode;
  };

  type ValueCellProps<R extends Table.Row, M extends Model.Model> = Table.CellProps<R, M, string | number | null> & {
    // This is used for extending cells.  Normally, the value formatter will be included on the ColDef
    // of the associated column.  But when extending a Cell, we sometimes want to provide a formatter
    // for that specific cell.
    readonly valueFormatter?: Table.ValueFormatter;
  };
}

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace BudgetTable {
  interface RowMeta extends Table.RowMeta {
    readonly isGroupRow?: boolean;
    readonly children?: number[];
    readonly group?: number | null;
  }

  interface Row extends Table.Row {
    readonly meta: BudgetTable.RowMeta;
  }

  interface RowGroup<R extends BudgetTable.Row, M extends Model.Model> {
    readonly rows: Table.ModelWithRow<R, M>[];
    readonly group?: Model.Group | null;
  }

  type TableData<R extends BudgetTable.Row, M extends Model.Model> = BudgetTable.RowGroup<R, M>[];

  interface Grid<R extends BudgetTable.Row, M extends Model.Model> extends Table.Grid<R, M> {
    applyGroupColorChange: (group: Model.Group) => void;
  }
  /* eslint-disable no-shadow */
  type Table<R extends BudgetTable.Row, M extends Model.Model> = Table.Table<R, M> & BudgetTable.Grid<R, M>;
  type GridRef<R extends BudgetTable.Row, M extends Model.Model> = { current: BudgetTable.Grid<R, M> };
  type Ref<R extends BudgetTable.Row, M extends Model.Model> = { current: BudgetTable.Table<R, M> };

  type LevelType = "budget" | "account" | "subaccount";

  interface CellProps<R extends Table.Row, M extends Model.Model, V = any> extends Table.CellProps<R, M, V> {
    readonly budgetType: Model.BudgetType;
    readonly levelType: BudgetTable.LevelType;
  }
  type ValueCellProps<R extends Table.Row, M extends Model.Model> = BudgetTable.CellProps<R, M, string | number | null>;
}

namespace PdfTable {
  type CellLocation = { index: number, colIndex: number };

  type CellCallbackParams<R extends Table.Row, M extends Model.Model> = {
    readonly location: PdfTable.CellLocation;
    readonly column: Table.PdfColumm<R, M>;
    readonly row: R;
    readonly isHeader: boolean;
    readonly rawValue: any;
    readonly value: any;
    readonly indented: boolean;
  }

  type CellCallback<R extends Table.Row, M extends Model.Model, V = any> = (params: PdfTable.CellCallbackParams<R, M>) => V;
  type OptionalCellCallback<R extends Table.Row, M extends Model.Model, V = any> = V | PdfTable.CellCallback<R, M, V> | undefined;

  interface _CellClassName<R extends Table.Row, M extends Model.Model> {
    [n: number]: OptionalCellCallback<R, M, string> | _CellClassName<R, M>;
  };
  type CellClassName<R extends Table.Row, M extends Model.Model> = OptionalCellCallback<R, M, string> | _CellClassName<R, M>;

  interface _CellStyle<R extends Table.Row, M extends Model.Model> {
    [n: number]: OptionalCellCallback<R, M, import("@react-pdf/types").Style> | _CellStyle<R, M>;
  };
  type CellStyle<R extends Table.Row, M extends Model.Model> = OptionalCellCallback<R, M, import("@react-pdf/types").Style> | _CellStyle<R, M>;

  type CellStandardProps<R extends Table.Row, M extends Model.Model> = {
    readonly style?: PdfTable.CellStyle<R, M>;
    readonly className?: PdfTable.CellClassName<R, M>;
    readonly textStyle?: PdfTable.CellStyle<R, M>;
    readonly textClassName?: PdfTable.CellClassName<R, M>;
  }

  interface FooterColumn {
    readonly value?: any;
    readonly textStyle?: import("@react-pdf/types").Style;
  }

  type Formatter = (value: string | number) => string;

  interface Column<R extends Table.Row, M extends Model.Model> extends Table.DualColumn<R, M> {
    // In the PDF case, since we cannot dynamically resize columns, the width refers to a ratio
    // of the column width to the overall table width assuming that all columns are present.  When
    // columns are hidden/shown, this ratio is adjusted.
    readonly width: number;
    readonly cellProps?: PdfTable.CellStandardProps;
    readonly headerCellProps?: PdfTable.CellStandardProps;
    readonly footer?: Table.FooterPdfColumn;
    readonly cellContentsVisible?: PdfTable.OptionalCellCallback<R, M, boolean>;
    readonly formatter?: PdfTable.Formatter;
    readonly cellRenderer?: (params: PdfTable.CellCallbackParams<R, M>) => JSX.Element;
    // NOTE: This only applies for the individual Account tables, not gf the overall
    // Accounts table.
    readonly childFooter?: (s: M) => Table.FooterPdfColumn;
  }
}

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace PdfBudgetTable {
  // Either the TopSheet page or an ID of the account.
  type TableOption = "topsheet" | number;

  interface Options {
    readonly header: Omit<HeaderTemplateFormData, "name">;
    readonly columns: Table.Field<Tables.PdfSubAccountRow, Model.PdfSubAccount>[];
    readonly tables?: TableOption[] | null | undefined;
    readonly excludeZeroTotals: boolean;
    readonly notes?: RichText.Block[];
    readonly includeNotes: boolean;
  }
}
