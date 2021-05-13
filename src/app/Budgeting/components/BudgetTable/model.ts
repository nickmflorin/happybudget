import { TooltipPropsWithTitle } from "antd/lib/tooltip";
import { ColDef, CellClassParams, GridOptions, ColumnApi, GridApi, Column } from "@ag-grid-community/core";
import RowManager from "lib/tabling/managers";

export interface BudgetTableMenuAction {
  readonly icon: JSX.Element;
  readonly tooltip?: Partial<TooltipPropsWithTitle> | string;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
}

export interface BudgetTableActionsParams<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly onDelete: () => void;
  readonly selectedRows: R[];
}

export interface GroupProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly onGroupRows: (rows: R[]) => void;
  readonly onDeleteGroup: (group: G) => void;
  readonly onEditGroup: (group: G) => void;
  readonly onRowRemoveFromGroup: (row: R) => void;
  readonly onRowAddToGroup: (groupId: number, row: R) => void;
}

export interface CookiesProps {
  readonly ordering?: string;
}

export interface CustomColDef<R extends Table.Row<G>, G extends Model.Group = Model.Group>
  extends Omit<ColDef, "field"> {
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

export interface BudgetTableMenuProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly columns: CustomColDef<R, G>[];
  readonly actions?: ((params: BudgetTableActionsParams<R, G>) => BudgetTableMenuAction[]) | BudgetTableMenuAction[];
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

export interface BudgetFooterGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly options: GridOptions;
  // TODO: Refactor so we only have to provide one of these.
  readonly columns: CustomColDef<R, G>[];
  readonly colDefs: CustomColDef<R, G>[];
  readonly frameworkComponents?: { [key: string]: any };
  readonly identifierField: string;
  readonly identifierValue?: string | null;
  readonly loadingBudget?: boolean | undefined;
  readonly sizeColumnsToFit?: boolean | undefined;
  readonly setColumnApi: (api: ColumnApi) => void;
}

export interface TableFooterGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly options: GridOptions;
  // TODO: Refactor so we only have to provide one of these.
  readonly columns: CustomColDef<R, G>[];
  readonly colDefs: CustomColDef<R, G>[];
  readonly frameworkComponents?: { [key: string]: any };
  readonly identifierField: string;
  readonly identifierValue?: string | null;
  readonly sizeColumnsToFit?: boolean | undefined;
  readonly setColumnApi: (api: ColumnApi) => void;
}

// Props provided to the BudgetTable that are passed directly through to the PrimaryGrid.
interface PrimaryGridPassThroughProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly groups?: G[];
  readonly groupParams?: GroupProps<R, G>;
  readonly frameworkComponents?: { [key: string]: any };
  readonly sizeColumnsToFit?: boolean | undefined;
  readonly search?: string;
  // Manually triggers a refresh to a row when certain changes occur.  Sometimes, a row R can have
  // fields that are not displayed in the grid but used to generate HTML columns.  Since those fields
  // are not explicitly displayed in the grid, AG Grid will not automatically refresh the columns
  // in the case that those fields change.
  readonly rowRefreshRequired?: (existing: R, row: R) => boolean;
  readonly onRowUpdate: (payload: Table.RowChange<R>) => void;
  readonly onRowBulkUpdate?: (payload: Table.RowChange<R>[]) => void;
  readonly onRowAdd: () => void;
  readonly onRowDelete: (row: R) => void;
}

export interface PrimaryGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group>
  extends PrimaryGridPassThroughProps<R, G> {
  readonly api: GridApi | undefined;
  readonly columnApi: ColumnApi | undefined;
  readonly table: R[];
  readonly options: GridOptions;
  readonly colDefs: CustomColDef<R, G>[];
  readonly setAllSelected: (value: boolean) => void;
  readonly isCellEditable: (row: R, colDef: ColDef | CustomColDef<R, G>) => boolean;
  readonly setApi: (api: GridApi) => void;
  readonly setColumnApi: (api: ColumnApi) => void;
  readonly processCellForClipboard: (column: Column, row: R, value: any) => string;
  readonly processCellFromClipboard: (column: Column, row: R, value: any) => any;
}

export interface BudgetTableProps<
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
> extends Omit<GridOptions, "frameworkComponents">,
    Omit<
      BudgetTableMenuProps<R, G>,
      "columns" | "onColumnsChange" | "onExport" | "onDelete" | "selected" | "selectedRows"
    >,
    PrimaryGridPassThroughProps<R, G>,
    StandardComponentProps {
  readonly columns: CustomColDef<R, G>[];
  readonly data: M[];
  readonly placeholders?: R[];
  readonly selected?: number[];
  readonly identifierField: string;
  readonly identifierFieldHeader: string;
  readonly identifierColumn?: Partial<CustomColDef<R, G>>;
  readonly actionColumn?: Partial<CustomColDef<R, G>>;
  readonly indexColumn?: Partial<CustomColDef<R, G>>;
  readonly expandColumn?: Partial<CustomColDef<R, G>>;
  readonly tableFooterIdentifierValue?: string | null;
  readonly budgetFooterIdentifierValue?: string | null;
  readonly saving: boolean;
  readonly loadingBudget?: boolean;
  readonly exportable?: boolean;
  readonly exportFileName?: string;
  readonly nonEditableCells?: (keyof R)[];
  readonly cookies?: CookiesProps;
  readonly loading?: boolean;
  readonly renderFlag?: boolean;
  readonly manager: RowManager<R, M, G, P>;
  // Callback to conditionally set the ability of a row to expand or not.  Only applicable if
  // onRowExpand is provided to the BudgetTable.
  readonly rowCanExpand?: (row: R) => boolean;
  readonly cellClass?: (params: CellClassParams) => string | undefined;
  readonly onRowSelect: (id: number) => void;
  readonly onRowDeselect: (id: number) => void;
  readonly onRowExpand?: null | ((id: number) => void);
  readonly onBack?: () => void;
  readonly isCellEditable?: (row: R, col: ColDef) => boolean;
  readonly isCellSelectable?: (row: R, col: ColDef) => boolean;
}
