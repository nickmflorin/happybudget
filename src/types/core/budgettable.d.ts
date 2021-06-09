/// <reference path="./modeling.d.ts" />
/// <reference path="./table.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace BudgetTable {
  type ColumnTypeId =
    | "text"
    | "longText"
    | "singleSelect"
    | "contactCard"
    | "phoneNumber"
    | "email"
    | "number"
    | "phone"
    | "contact"
    | "currency"
    | "sum"
    | "percentage"
    | "date";
  type ColumnAlignment = "right" | "left" | null;

  interface ColumnType {
    readonly id: ColumnTypeId;
    readonly align?: ColumnAlignment;
    readonly icon?: any;
  }

  // TODO: We need to merge this together with other mechanics.
  interface CellValueChangedParams<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly column: import("@ag-grid-community/core").Column;
    readonly row: R;
    readonly oldRow: R | null;
    readonly node: import("@ag-grid-community/core").RowNode;
    readonly oldValue: any;
    readonly newValue: any;
    readonly change: Table.Change<R>;
  }

  interface CellPositionMoveOptions {
    readonly startEdit?: boolean;
  }

  interface GroupProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly onGroupRows: (rows: R[]) => void;
    readonly onDeleteGroup: (group: G) => void;
    readonly onEditGroup: (group: G) => void;
    readonly onRowRemoveFromGroup: (row: R) => void;
    readonly onRowAddToGroup: (groupId: number, row: R) => void;
  }

  interface CookiesProps {
    readonly ordering?: string;
  }

  type CellDoneEditingEvent =
    | import("react").SyntheticEvent
    | KeyboardEvent
    | import("antd/lib/checkbox").CheckboxChangeEvent;

  // I really don't know why, but extending import("@ag-grid-community/core").ICellEditorParams
  // does not work here.
  interface CellEditorParams {
    readonly value: any;
    readonly keyPress: number | null;
    readonly charPress: string | null;
    readonly column: import("@ag-grid-community/core").Column;
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
    readonly onDoneEditing: (e: BudgetTable.CellDoneEditingEvent) => void;
  }

  interface ColDef<R extends Table.Row<G>, G extends Model.Group = Model.Group>
    extends Omit<import("@ag-grid-community/core").ColDef, "field"> {
    readonly type: ColumnTypeId;
    readonly nullValue?: null | "" | 0 | [];
    // If true, a Backspace/Delete will cause the cell to clear before going into edit mode.  This
    // is particularly useful for Dropdowns rendered via a custom Cell Editor (Popup) where we need
    // to trigger a cell clear without showing the dropdown.
    readonly clearBeforeEdit?: boolean;
    readonly field: keyof R & string;
    readonly isCalculated?: boolean;
    readonly budgetTotal?: number;
    readonly tableTotal?: number;
    readonly excludeFromExport?: boolean;
    // When exporting, the default will be to use the processCellForClipboard unless
    // processCellForExport is also provided.
    readonly processCellForExport?: (row: R) => string;
    readonly processCellForClipboard?: (row: R) => string;
    readonly processCellFromClipboard?: (value: string) => any;
  }

  interface MenuAction {
    readonly icon: JSX.Element;
    readonly tooltip?: Partial<import("antd/lib/tooltip").TooltipPropsWithTitle> | string;
    readonly onClick?: () => void;
    readonly disabled?: boolean;
  }

  interface MenuActionParams<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly onDelete: () => void;
    readonly selectedRows: R[];
  }

  interface MenuProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly columns: BudgetTable.ColDef<R, G>[];
    readonly actions?:
      | ((params: BudgetTable.MenuActionParams<R, G>) => BudgetTable.MenuAction[])
      | BudgetTable.MenuAction[];
    readonly saving?: boolean;
    readonly selected?: boolean;
    readonly search?: string;
    readonly canExport?: boolean;
    readonly canToggleColumns?: boolean;
    readonly canSearch?: boolean;
    readonly selectedRows: R[];
    readonly detached?: boolean;
    readonly onSearch?: (value: string) => void;
    readonly onSelectAll: (checked: boolean) => void;
    // TODO: Stop using Field type.
    readonly onColumnsChange: (fields: Field[]) => void;
    readonly onExport: (fields: Field[]) => void;
    readonly onDelete: () => void;
  }

  // The abstract/generic <Grid> component that wraps AG Grid right at the interface.
  interface GridProps
    extends Omit<
      import("@ag-grid-community/react").AGGridReactProps,
      "columnDefs" | "overlayNoRowsTemplate" | "overlayLoadingTemplate" | "modules" | "debug"
    > {
    readonly columnDefs: BudgetTable.ColDef<any, any>[];
  }

  interface BudgetFooterGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly options: GridOptions;
    // TODO: Refactor so we only have to provide one of these.
    readonly columns: BudgetTable.ColDef<R, G>[];
    readonly colDefs: BudgetTable.ColDef<R, G>[];
    readonly identifierField: string;
    readonly identifierValue?: string | null;
    readonly loadingBudget?: boolean | undefined;
    readonly sizeColumnsToFit?: boolean | undefined;
    readonly setColumnApi: (api: import("@ag-grid-community/core").ColumnApi) => void;
  }

  interface TableFooterGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly options: import("@ag-grid-community/core").GridOptions;
    // TODO: Refactor so we only have to provide one of these.
    readonly columns: BudgetTable.ColDef<R, G>[];
    readonly colDefs: BudgetTable.ColDef<R, G>[];
    readonly identifierField: string;
    readonly identifierValue?: string | null;
    readonly sizeColumnsToFit?: boolean | undefined;
    readonly setColumnApi: (api: import("@ag-grid-community/core").ColumnApi) => void;
  }

  // Props provided to the BudgetTable that are passed directly through to the PrimaryGrid.
  interface PrimaryGridPassThroughProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly groups?: G[];
    readonly groupParams?: BudgetTable.GroupProps<R, G>;
    readonly frameworkComponents?: { [key: string]: any };
    readonly sizeColumnsToFit?: boolean | undefined;
    readonly search?: string;
    readonly identifierField: string;
    readonly onTableChange: (payload: Table.Change<R>) => void;
    readonly onRowAdd: () => void;
    readonly onRowDelete: (row: R) => void;
    // Callback to conditionally set the ability of a row to expand or not.  Only applicable if
    // onRowExpand is provided to the BudgetTable.
    readonly rowCanExpand?: (row: R) => boolean;
    readonly onRowExpand?: null | ((id: number) => void);
    readonly onBack?: () => void;
  }

  interface PrimaryGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group>
    extends PrimaryGridPassThroughProps<R, G> {
    readonly api: import("@ag-grid-community/core").GridApi | undefined;
    readonly columnApi: import("@ag-grid-community/core").ColumnApi | undefined;
    readonly table: R[];
    readonly options: import("@ag-grid-community/core").GridOptions;
    readonly colDefs: BudgetTable.ColDef<R, G>[];
    readonly onCellValueChanged: (params: BudgetTable.CellValueChangedParams<R, G>) => void;
    readonly setAllSelected: (value: boolean) => void;
    readonly isCellEditable: (row: R, colDef: BudgetTable.ColDef<R, G>) => boolean;
    readonly setApi: (api: import("@ag-grid-community/core").GridApi) => void;
    readonly setColumnApi: (api: import("@ag-grid-community/core").ColumnApi) => void;
    readonly processCellForClipboard: (column: import("@ag-grid-community/core").Column, row: R, value: any) => string;
    readonly processCellFromClipboard: (column: import("@ag-grid-community/core").Column, row: R, value: any) => any;
  }

  interface Props<
    R extends Table.Row<G>,
    M extends Model.Model,
    G extends Model.Group = Model.Group,
    P extends Http.ModelPayload<M> = Http.ModelPayload<M>
  > extends Omit<import("@ag-grid-community/core").GridOptions, "frameworkComponents">,
      Omit<
        BudgetTable.MenuProps<R, G>,
        "columns" | "onColumnsChange" | "onExport" | "onDelete" | "selected" | "selectedRows"
      >,
      BudgetTable.PrimaryGridPassThroughProps<R, G>,
      StandardComponentProps {
    readonly columns: BudgetTable.ColDef<R, G>[];
    readonly data: M[];
    readonly placeholders?: R[];
    readonly selected?: number[];
    readonly identifierFieldHeader: string;
    readonly identifierColumn?: Partial<BudgetTable.ColDef<R, G>>;
    readonly actionColumn?: Partial<BudgetTable.ColDef<R, G>>;
    readonly indexColumn?: Partial<BudgetTable.ColDef<R, G>>;
    readonly expandColumn?: Partial<BudgetTable.ColDef<R, G>>;
    readonly tableFooterIdentifierValue?: string | null;
    readonly budgetFooterIdentifierValue?: string | null;
    readonly saving: boolean;
    readonly loadingBudget?: boolean;
    readonly exportable?: boolean;
    readonly exportFileName?: string;
    readonly nonEditableCells?: (keyof R)[];
    readonly cookies?: BudgetTable.CookiesProps;
    readonly loading?: boolean;
    readonly renderFlag?: boolean;
    readonly manager: Table.IRowManager<R, M, P, G>;
    readonly cellClass?: (params: import("@ag-grid-community/core").CellClassParams) => string | undefined;
    readonly onRowSelect: (id: number) => void;
    readonly onRowDeselect: (id: number) => void;
    readonly isCellEditable?: (row: R, col: BudgetTable.ColDef) => boolean;
    readonly isCellSelectable?: (row: R, col: BudgetTable.ColDef) => boolean;
  }
}
