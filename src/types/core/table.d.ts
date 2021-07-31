/// <reference path="./modeling.d.ts" />
/// <reference path="./ui.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace GenericTable {
  interface PageAndSize {
    readonly page: number;
    readonly pageSize: number;
  }

  interface RowMeta {
    readonly group?: number | null;
  };

  interface Row<E extends Table.RowMeta = Table.RowMeta> extends Record<string, any> {
    readonly id: number;
    readonly meta: E;
  }

  type ModelWithRow<R extends GenericTable.Row<E>, M extends Model.Model, E extends Table.RowMeta = Table.RowMeta> = {
    readonly row: R;
    readonly model: M;
  }

  interface RowGroup<R extends GenericTable.Row<E>, M extends Model.Model, E extends Table.RowMeta = Table.RowMeta> {
    readonly rows: GenericTable.ModelWithRow<R, M, E>[];
    readonly group?: Model.Group | null;
  }

  type TableData<R extends GenericTable.Row> = GenericTable.RowGroup<R>[];

  interface RowColorDefinition {
    readonly backgroundColor?: string;
    readonly color?: string;
  }

  type Field<R extends Table.Row, M extends Model.Model> = Omit<keyof R & keyof M & string, "id">;

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
    readonly id: GenericTable.ColumnTypeId;
    readonly style?: React.CSSProperties;
    readonly icon?: any;
    readonly editorIsPopup?: boolean;
    readonly pdfOverrides?: Omit<Partial<GenericTable.ColumnType>, "id" | "editorIsPopup">;
    readonly headerOverrides?: Omit<Partial<GenericTable.ColumnType>, "id" | "editorIsPopup" | "icon" | "pdfOverrides">;
  }

  interface Column<R extends GenericTable.Row, M extends Model.Model> {
    readonly field: GenericTable.Field<R, M>;
    readonly headerName?: string | null | undefined;
    readonly isCalculated?: boolean;
    readonly columnType: GenericTable.ColumnTypeId;
    readonly nullValue?: GenericTable.NullValue;
    readonly index?: number;
    readonly getRowValue?: (m: M) => R[keyof R];
  }

  type NullValue = null | "" | 0 | [];
  type Formatter = (value: string | number) => string;
}

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Table {
  type FieldBehavior = "read" | "write";

  interface RowMeta extends GenericTable.RowMeta {
    readonly isGroupFooter?: boolean;
    readonly isTableFooter?: boolean;
    readonly isBudgetFooter?: boolean;
    readonly children?: number[];
    readonly label?: string | number | null;
  }

  type Row = GenericTable.Row<Table.RowMeta>;

  interface Column<R extends Table.Row, M extends Model.Model, V = any> extends Omit<import("@ag-grid-community/core").ColDef, "field" | "headerName">, GenericTable.Column<R, M> {
    readonly fieldBehavior?: Table.FieldBehavior[]; // Defaults to ["read", "write"]
    readonly excludeFromExport?: boolean;
    readonly budget?: FooterColumn<R>;
    readonly footer?: FooterColumn<R>;
    readonly isCalculating?: boolean;
    readonly onCellFocus?: (params: CellFocusedParams<R, M>) => void;
    readonly onCellUnfocus?: (params: CellFocusedParams<R, M>) => void;
    readonly refreshColumns?: (change: Table.CellChange<R, M>) => Field<R, M> | Field<R, M>[] | null;
    readonly getModelValue?: (row: R) => M[keyof M];
    readonly getHttpValue?: (value: V) => any;
    readonly processCellForClipboard?: (row: R) => string;
    readonly processCellFromClipboard?: (value: string) => any;
  }

  type APIs = {
    readonly grid: import("@ag-grid-community/core").GridApi;
    readonly column: import("@ag-grid-community/core").ColumnApi;
  };

  interface ColumnVisibilityChange {
    readonly field: string;
    readonly visible: boolean;
  }

  interface FooterColumn<R extends Table.Row> extends Omit<import("@ag-grid-community/core").ColDef, "field" | "headerName"> {
    readonly value?: any;
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
    readonly field: GenericTable.Field<R, M>;
    readonly column: Table.Column<R, M, V>;
    readonly row: R;
    readonly id: number;
  };

  type NestedCellChange<R extends Table.Row, M extends Model.Model, V = any> = Omit<Table.CellChange<R, M, V>, "field" | "id">;
  type CellAdd<R extends Table.Row, M extends Model.Model, V = any> = {
    readonly value: V;
    readonly field: GenericTable.Field<R, M>;
    readonly column: Table.Column<R, M, V>;
  };
  type NestedCellAdd<R extends Table.Row, M extends Model.Model, V = any> = Omit<Table.CellAdd<R, M, V>, "field">;

  type RowChangeData<R extends Table.Row, M extends Model.Model> = {
    readonly [key in GenericTable.Field<R, M>]?: Table.NestedCellChange<R, M>;
  };

  type RowChange<R extends Table.Row, M extends Model.Model> = {
    readonly id: number;
    readonly data: Table.RowChangeData<R, M>;
  };

  type RowAddData<R extends Table.Row, M extends Model.Model> = {
    readonly [key in GenericTable.Field<R, M>]?: Table.NestedCellAdd<R, M>;
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

  type ChangeEvent<R extends Table.Row, M extends Model.Model> = GrouplessEvent<R, M> | GroupEvent<R, M>;

  interface CellPositionMoveOptions {
    readonly startEdit?: boolean;
  }

  type CellDoneEditingEvent =
    | import("react").SyntheticEvent
    | KeyboardEvent;

  // I really don't know why, but extending import("@ag-grid-community/core").ICellEditorParams
  // does not work here.
  interface CellEditorParams<R extends Table.Row, M extends Model.Model, V = any> {
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
}

namespace PdfTable {
  type RowMeta = GenericTable.RowMeta & {};
  type Row = GenericTable.Row<PdfTable.RowMeta>;

  interface FooterColumn {
    readonly value?: any;
    readonly textStyle?: import("@react-pdf/types").Style;
  }

  type CellLocation = { index: number, colIndex: number };
  type CellCallbackParams<R extends PdfTable.Row, M extends Model.Model> = {
    readonly location: PdfTable.CellLocation;
    readonly column: Table.PdfColumm<R, M>;
    readonly row: R;
    readonly isHeader: boolean;
    readonly rawValue: any;
    readonly value: any;
    readonly indented: boolean;
  }

  type CellCallback<R extends PdfTable.Row, M extends Model.Model, V = any> = (params: PdfTable.CellCallbackParams<R, M>) => V;
  type OptionalCellCallback<R extends PdfTable.Row, M extends Model.Model, V = any> = V | PdfTable.CellCallback<R, M, V> | undefined;

  interface _CellClassName<R extends PdfTable.Row, M extends Model.Model> {
    [n: number]: OptionalCellCallback<R, M, string> | _CellClassName<R, M>;
  };
  type CellClassName<R extends PdfTable.Row, M extends Model.Model> = OptionalCellCallback<R, M, string> | _CellClassName<R, M>;

  interface _CellStyle<R extends PdfTable.Row, M extends Model.Model> {
    [n: number]: OptionalCellCallback<R, M, import("@react-pdf/types").Style> | _CellStyle<R, M>;
  };
  type CellStyle<R extends PdfTable.Row, M extends Model.Model> = OptionalCellCallback<R, M, import("@react-pdf/types").Style> | _CellStyle<R, M>;

  type CellStandardProps<R extends PdfTable.Row, M extends Model.Model> = {
    readonly style?: PdfTable.CellStyle<R, M>;
    readonly className?: PdfTable.CellClassName<R, M>;
    readonly textStyle?: PdfTable.CellStyle<R, M>;
    readonly textClassName?: PdfTable.CellClassName<R, M>;
  }

  interface Column<R extends PdfTable.Row, M extends Model.Model> extends GenericTable.Column<R, M> {
    readonly width?: string | number;
    readonly cellProps?: PdfTable.CellStandardProps;
    readonly headerCellProps?: PdfTable.CellStandardProps;
    readonly footer?: Table.FooterPdfColumn;
    readonly cellContentsVisible?: PdfTable.OptionalCellCallback<R, M, boolean>;
    readonly formatter?: Formatter;
    readonly cellRenderer?: (params: PdfTable.CellCallbackParams<R, M>) => JSX.Element;
    // NOTE: This only applies for the individual Account tables, not gf the overall
    // Accounts table.
    readonly childFooter?: (s: M) => Table.FooterPdfColumn;
  }
}

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace BudgetTable {

  type LevelType = "budget" | "account" | "subaccount";
  type GridId = "primary" | "tableFooter" | "budgetFooter";
  type GridSet<T> = { primary: T; tableFooter: T; budgetFooter: T };

  interface CookiesProps {
    readonly ordering?: string;
  }

  type MenuAction = {
    readonly icon: import("@fortawesome/fontawesome-svg-core").IconProp;
    readonly tooltip?: Partial<import("antd/lib/tooltip").TooltipPropsWithTitle> | string;
    readonly onClick?: () => void;
    readonly disabled?: boolean;
    readonly text?: string;
    readonly render?: RenderFunc;
    readonly wrap?: (children: ReactNode) => JSX.Element;
  }

  interface MenuActionParams<R extends Table.Row, M extends Model.Model> {
    readonly apis: Table.APIs;
    readonly columns: Table.Column<R, M>[];
  }

  interface MenuProps<R extends Table.Row, M extends Model.Model> {
    readonly apis: Table.APIs;
    readonly columns: Table.Column<R, M>[];
    readonly actions?:
      | ((params: BudgetTable.MenuActionParams<R>) => BudgetTable.MenuAction[])
      | BudgetTable.MenuAction[];
    readonly search?: string;
    readonly detached?: boolean;
    readonly onSearch?: (value: string) => void;
  }

  // The abstract/generic <Grid> component that wraps AG Grid right at the interface.
  interface GridProps<R extends Table.Row = Table.Row, M extends Model.Model>
    extends Omit<
      import("@ag-grid-community/react").AgGridReactProps,
      "columnDefs" | "overlayNoRowsTemplate" | "overlayLoadingTemplate" | "modules" | "debug"
    > {
    readonly columns: Table.Column<R, M>[];
  }

  interface SpecificGridProps<R extends Table.Row = Table.Row, M extends Model.Model> {
    readonly apis: Table.APIs | null;
    readonly onFirstDataRendered: (e: import("ag-grid-community/core").FirstDataRenderedEvent) => void;
    readonly onGridReady: (event: import("@ag-grid-community/core").GridReadyEvent) => void;
    readonly options?: import("@ag-grid-community/core").GridOptions;
    readonly columns: Table.Column<R, M>[];
  }

  interface BudgetFooterGridProps<R extends Table.Row = Table.Row, M extends Model.Model> extends SpecificGridProps<R, M> {
    readonly loadingBudget?: boolean | undefined;
  }

  interface TableFooterGridProps<R extends Table.Row = Table.Row, M extends Model.Model> extends SpecificGridProps<R, M> {
    readonly loadingParent?: boolean;
  }

  // Props provided to the BudgetTable that are passed directly through to the PrimaryGrid.
  interface PrimaryGridPassThroughProps<
    R extends Table.Row,
    M extends Model.Model
  > {
    readonly data: M[];
    readonly groups?: Model.Group[];
    readonly frameworkComponents?: { [key: string]: any };
    readonly search?: string;
    readonly columns: Table.Column<R, M>[];
    readonly rowLabel?: string;
    readonly onGroupRows?: (rows: R[]) => void;
    readonly onCellFocusChanged?: (params: Table.CellFocusChangedParams<R, M>) => void;
    readonly onChangeEvent: (event: Table.ChangeEvent<R, M>) => void;
    // Callback to conditionally set the ability of a row to expand or not.  Only applicable if
    // onRowExpand is provided to the BudgetTable.
    readonly rowCanExpand?: (row: R) => boolean;
    readonly onRowExpand?: null | ((id: number) => void);
    readonly onBack?: () => void;
    readonly modelToRow?: (m: M) => R;
    readonly getModelLabel?: (m: M) => string | null;
    readonly getModelChildren?: (m: M) => number[];
  }

  interface PrimaryGridRef<R extends Table.Row, M extends Model.Model> {
    readonly applyTableChange: (event: Table.ChangeEvent<R, M>) => void;
    readonly applyGroupColorChange: (group: Model.Group) => void;
    readonly getCSVData: (fields?: string[]) => CSVData;
  }

  interface PrimaryGridProps<R extends Table.Row, M extends Model.Model>
    extends BudgetTable.PrimaryGridPassThroughProps<R, M>,
      Omit<BudgetTable.MenuProps<R, M>, "columns" | "apis">,
      SpecificGridProps<R, M> {
    readonly gridRef: import("react").RefObject<PrimaryGridRef>;
    readonly ordering: FieldOrder<keyof R>[];
    readonly isCellEditable: (row: R, colDef: Table.Column<R, M>) => boolean;
  }

  interface Ref<R extends Table.Row, M extends Model.Model> extends PrimaryGridRef<R, M> {
    readonly changeColumnVisibility: (changes: Table.ColumnVisibilityChange[]) => void;
    readonly setColumnVisibility: (change: Table.ColumnVisibilityChange) => void;
  }

  interface Props<
    R extends Table.Row,
    M extends Model.Model,
    P
  > extends Omit<BudgetTable.MenuProps<R, M>, "columns" | "apis">,
      BudgetTable.PrimaryGridPassThroughProps<R, M>,
      StandardComponentProps {
    readonly tableRef: import("react").RefObject<BudgetTable.Ref<R, M>>;
    readonly indexColumn?: Partial<Table.Column<R, M>>;
    readonly expandColumn?: Partial<Table.Column<R, M>>;
    readonly loadingBudget?: boolean;
    readonly loadingParent?: boolean;
    readonly exportable?: boolean;
    readonly nonEditableCells?: (keyof R)[];
    readonly cookies?: BudgetTable.CookiesProps;
    readonly loading?: boolean;
    readonly levelType: BudgetTable.LevelType;
    readonly budgetType: Model.BudgetType;
    readonly onEditGroup?: (group: Model.Group) => void;
    readonly cellClass?: (params: import("@ag-grid-community/core").CellClassParams) => string | undefined;
    readonly isCellEditable?: (row: R, col: Table.Column) => boolean;
    readonly isCellSelectable?: (row: R, col: Table.Column) => boolean;
  }

  interface AccountRow extends Table.Row {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    // Only defined for non-Template cases.
    readonly variance?: number | null;
    readonly actual?: number | null;
  }

  interface SubAccountRow extends Table.Row {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Model.Tag | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly estimated: number | null;
    readonly fringes: Model.Fringe[];
    // Only defined for non-Template cases.
    readonly contact?: number | null;
    readonly variance?: number | null;
    readonly actual?: number | null;
  }

  interface FringeRow extends Table.Row {
    readonly color: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number | null;
    readonly unit: Model.FringeUnit;
  }

  interface ActualRow extends Table.Row {
    readonly description: string | null;
    readonly vendor: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_method: Model.PaymentMethod | null;
    readonly subaccount: Model.SimpleAccount;
    readonly payment_id: string | null;
    readonly value: string | null;
  }
}

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace PdfBudgetTable {

  // Either the TopSheet page or an ID of the account.
  type TableOption = "topsheet" | number;

  interface Options {
    readonly header: Omit<HeaderTemplateFormData, "name">;
    readonly columns: GenericTable.Field<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>[];
    readonly tables?: TableOption[] | null | undefined;
    readonly excludeZeroTotals: boolean;
    readonly notes?: RichText.Block[];
    readonly includeNotes: boolean;
  }

  interface SubAccountRow extends PdfTable.Row {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Model.Tag | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly estimated: number | null;
  }

  interface AccountRow extends PdfTable.Row {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly actual: number | null;
  }

  interface TableProps<R extends PdfTable.Row, M extends Model.Model> {
    readonly columns: PdfTable.Column<R, M>[];
    readonly options: PdfBudgetTable.Options;
  }

  type AccountsTableProps = TableProps<PdfBudgetTable.AccountRow, Model.PdfAccount> & {
    readonly data: Model.PdfAccount[];
    readonly groups: Model.Group[];
  }

  type AccountTableProps = TableProps<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount> & {
    readonly account: Model.PdfAccount;
  }
}
