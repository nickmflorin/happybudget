/// <reference path="react/index.d.ts" />
/// <reference path="antd/lib/checkbox/index.d.ts" />
/// <reference path="antd/lib/tooltip/index.d.ts" />
/// <reference path="@ag-grid-community/core/index.d.ts" />

/// <reference path="./modeling.d.ts" />
/// <reference path="./table.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace BudgetTable {
  // TODO: Start consolidating with the RowChange related types in the global type set.
  interface CellValueChangedParams<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly column: Column;
    readonly row: R;
    readonly oldRow: R | null;
    readonly node: RowNode;
    readonly oldValue: any;
    readonly newValue: any;
    readonly change: Table.RowChange<R>;
  }

  interface MenuAction {
    readonly icon: JSX.Element;
    readonly tooltip?: Partial<TooltipPropsWithTitle> | string;
    readonly onClick?: () => void;
    readonly disabled?: boolean;
  }

  interface ActionsParams<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly onDelete: () => void;
    readonly selectedRows: R[];
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

  interface CellEditorParams extends ICellEditorParams {
    // When the cell editor finishes editing, the AG Grid callback (onCellDoneEditing)
    // does not have any context about what event triggered the completion, so we have
    // to handle that ourselves so we can trigger different behaviors depending on
    // how the selection was performed.
    readonly onDoneEditing: (e: SyntheticEvent | KeyboardEvent | CheckboxChangeEvent) => void;
  }

  interface CustomColDef<R extends Table.Row<G>, G extends Model.Group = Model.Group> extends Omit<ColDef, "field"> {
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
    // isBase?: boolean;
    // When exporting, the default will be to use the processCellForClipboard unless
    // processCellForExport is also provided.
    readonly processCellForExport?: (row: R) => string;
    readonly processCellForClipboard?: (row: R) => string;
    readonly processCellFromClipboard?: (value: string) => any;
  }

  interface IMenu<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly columns: CustomColDef<R, G>[];
    readonly actions?:
      | ((params: BudgetTable.ActionsParams<R, G>) => BudgetTable.MenuAction[])
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
    readonly onColumnsChange: (fields: Field[]) => void;
    readonly onExport: (fields: Field[]) => void;
    readonly onDelete: () => void;
  }

  interface BudgetFooterGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly options: GridOptions;
    // TODO: Refactor so we only have to provide one of these.
    readonly columns: BudgetTable.CustomColDef<R, G>[];
    readonly colDefs: BudgetTable.CustomColDef<R, G>[];
    readonly frameworkComponents?: { [key: string]: any };
    readonly identifierField: string;
    readonly identifierValue?: string | null;
    readonly loadingBudget?: boolean | undefined;
    readonly sizeColumnsToFit?: boolean | undefined;
    readonly setColumnApi: (api: ColumnApi) => void;
  }

  interface TableFooterGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly options: GridOptions;
    // TODO: Refactor so we only have to provide one of these.
    readonly columns: BudgetTable.CustomColDef<R, G>[];
    readonly colDefs: BudgetTable.CustomColDef<R, G>[];
    readonly frameworkComponents?: { [key: string]: any };
    readonly identifierField: string;
    readonly identifierValue?: string | null;
    readonly sizeColumnsToFit?: boolean | undefined;
    readonly setColumnApi: (api: ColumnApi) => void;
  }

  // Props provided to the BudgetTable that are passed directly through to the PrimaryGrid.
  interface PrimaryGridPassThroughProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
    readonly groups?: G[];
    readonly groupParams?: BudgetTable.GroupProps<R, G>;
    readonly frameworkComponents?: { [key: string]: any };
    readonly sizeColumnsToFit?: boolean | undefined;
    readonly search?: string;
    readonly identifierField: string;
    readonly onRowUpdate: (payload: Table.RowChange<R>) => void;
    readonly onRowBulkUpdate?: (payload: Table.RowChange<R>[]) => void;
    readonly onRowAdd: () => void;
    readonly onRowDelete: (row: R) => void;
    // Callback to conditionally set the ability of a row to expand or not.  Only applicable if
    // onRowExpand is provided to the BudgetTable.
    readonly rowCanExpand?: (row: R) => boolean;
    readonly onRowExpand?: null | ((id: number) => void);
    readonly onBack?: () => void;
  }

  interface PrimaryGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group>
    extends BudgetTable.PrimaryGridPassThroughProps<R, G> {
    readonly api: GridApi | undefined;
    readonly columnApi: ColumnApi | undefined;
    readonly table: R[];
    readonly options: GridOptions;
    readonly colDefs: BudgetTable.CustomColDef<R, G>[];
    readonly onCellValueChanged: (params: BudgetTable.CellValueChangedParams<R, G>) => void;
    readonly setAllSelected: (value: boolean) => void;
    readonly isCellEditable: (row: R, colDef: ColDef | BudgetTable.CustomColDef<R, G>) => boolean;
    readonly setApi: (api: GridApi) => void;
    readonly setColumnApi: (api: ColumnApi) => void;
    readonly processCellForClipboard: (column: Column, row: R, value: any) => string;
    readonly processCellFromClipboard: (column: Column, row: R, value: any) => any;
  }

  interface ITable<
    R extends Table.Row<G>,
    M extends Model.Model,
    G extends Model.Group = Model.Group,
    P extends Http.ModelPayload<M> = Http.ModelPayload<M>
  > extends Omit<GridOptions, "frameworkComponents">,
      Omit<
        BudgetTable.IMenu<R, G>,
        "columns" | "onColumnsChange" | "onExport" | "onDelete" | "selected" | "selectedRows"
      >,
      BudgetTable.PrimaryGridPassThroughProps<R, G>,
      StandardComponentProps {
    readonly columns: BudgetTable.CustomColDef<R, G>[];
    readonly data: M[];
    readonly placeholders?: R[];
    readonly selected?: number[];
    readonly identifierFieldHeader: string;
    readonly identifierColumn?: Partial<BudgetTable.CustomColDef<R, G>>;
    readonly actionColumn?: Partial<BudgetTable.CustomColDef<R, G>>;
    readonly indexColumn?: Partial<BudgetTable.CustomColDef<R, G>>;
    readonly expandColumn?: Partial<BudgetTable.CustomColDef<R, G>>;
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
    readonly cellClass?: (params: CellClassParams) => string | undefined;
    readonly onRowSelect: (id: number) => void;
    readonly onRowDeselect: (id: number) => void;
    readonly isCellEditable?: (row: R, col: ColDef) => boolean;
    readonly isCellSelectable?: (row: R, col: ColDef) => boolean;
  }
}
