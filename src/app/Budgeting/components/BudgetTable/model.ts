import { TooltipPropsWithTitle } from "antd/lib/tooltip";
import { ColDef, CellClassParams, RowNode, GridOptions, ColumnApi, GridApi } from "@ag-grid-community/core";
import RowManager from "lib/tabling/managers";

export interface GetExportValueParams {
  node: RowNode;
  colDef: ColDef;
  value: string | undefined;
}

export type ExportValueGetters = { [key: string]: (params: GetExportValueParams) => string };

export interface BudgetTableMenuAction {
  icon: JSX.Element;
  tooltip?: Partial<TooltipPropsWithTitle> | string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface BudgetTableActionsParams<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  onDelete: () => void;
  selectedRows: R[];
}

export interface GroupProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  onGroupRows: (rows: R[]) => void;
  onDeleteGroup: (group: G) => void;
  onEditGroup: (group: G) => void;
  onRowRemoveFromGroup: (row: R) => void;
  onRowAddToGroup: (groupId: number, row: R) => void;
}

export interface CookiesProps {
  ordering?: string;
}

export interface CustomColDef<R extends Table.Row<G>, G extends Model.Group = Model.Group>
  extends Omit<ColDef, "field"> {
  onClearValue?: any;
  // If true, a Backspace/Delete will cause the cell to clear before going into edit mode.  This
  // is particularly useful for Dropdowns rendered via a custom Cell Editor (Popup) where we need
  // to trigger a cell clear without showing the dropdown.
  clearBeforeEdit?: boolean;
  field: keyof R & string;
  isCalculated?: boolean;
  budgetTotal?: number;
  tableTotal?: number;
  // isBase?: boolean;
}

export interface BudgetTableMenuProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  columns: CustomColDef<R, G>[];
  actions?: ((params: BudgetTableActionsParams<R, G>) => BudgetTableMenuAction[]) | BudgetTableMenuAction[];
  saving?: boolean;
  selected?: boolean;
  search?: string;
  canExport?: boolean;
  canToggleColumns?: boolean;
  canSearch?: boolean;
  selectedRows: R[];
  detached?: boolean;
  onSearch?: (value: string) => void;
  onSelectAll: (checked: boolean) => void;
  onColumnsChange: (fields: Field[]) => void;
  onExport: (fields: Field[]) => void;
  onDelete: () => void;
}

export interface BudgetFooterGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  options: GridOptions;
  // TODO: Refactor so we only have to provide one of these.
  columns: CustomColDef<R, G>[];
  colDefs: CustomColDef<R, G>[];
  frameworkComponents?: { [key: string]: any };
  identifierField: string;
  identifierValue?: string | null;
  loadingBudget?: boolean | undefined;
  sizeColumnsToFit?: boolean | undefined;
  setColumnApi: (api: ColumnApi) => void;
}

export interface TableFooterGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  options: GridOptions;
  // TODO: Refactor so we only have to provide one of these.
  columns: CustomColDef<R, G>[];
  colDefs: CustomColDef<R, G>[];
  frameworkComponents?: { [key: string]: any };
  identifierField: string;
  identifierValue?: string | null;
  sizeColumnsToFit?: boolean | undefined;
  setColumnApi: (api: ColumnApi) => void;
}

interface PrimaryGridPassThroughProps<
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
> {
  manager: RowManager<R, M, G, P>;
  groups?: G[];
  groupParams?: GroupProps<R, G>;
  frameworkComponents?: { [key: string]: any };
  sizeColumnsToFit?: boolean | undefined;
  search: string;
  processCellForClipboard?: { [key in keyof R]?: (row: R) => any };
  rowRefreshRequired?: (existing: R, row: R) => boolean;
  onRowUpdate: (payload: Table.RowChange<R>) => void;
  onRowBulkUpdate?: (payload: Table.RowChange<R>[]) => void;
  onRowAdd: () => void;
  onRowDelete: (row: R) => void;
}

export interface PrimaryGridProps<
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
> extends PrimaryGridPassThroughProps<R, M, G, P> {
  api: GridApi | undefined;
  columnApi: ColumnApi | undefined;
  table: R[];
  options: GridOptions;
  colDefs: CustomColDef<R, G>[];
  setAllSelected: (value: boolean) => void;
  isCellEditable: (row: R, colDef: ColDef | CustomColDef<R, G>) => boolean;
  setApi: (api: GridApi) => void;
  setColumnApi: (api: ColumnApi) => void;
}

export interface BudgetTableProps<
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
> extends Omit<GridOptions, "processCellForClipboard">,
    Omit<
      BudgetTableMenuProps<R, G>,
      "columns" | "onColumnsChange" | "onExport" | "onDelete" | "selected" | "selectedRows"
    >,
    StandardComponentProps {
  columns: CustomColDef<R, G>[];
  data: M[];
  placeholders?: R[];
  selected?: number[];
  identifierField: string;
  identifierFieldHeader: string;
  identifierColumn?: Partial<CustomColDef<R, G>>;
  actionColumn?: Partial<CustomColDef<R, G>>;
  indexColumn?: Partial<CustomColDef<R, G>>;
  expandColumn?: Partial<CustomColDef<R, G>>;
  tableFooterIdentifierValue?: string | null;
  budgetFooterIdentifierValue?: string | null;
  saving: boolean;
  loadingBudget?: boolean;
  getExportValue?: ExportValueGetters;
  exportable?: boolean;
  exportFileName?: string;
  nonEditableCells?: (keyof R)[];
  cookies?: CookiesProps;
  loading?: boolean;
  renderFlag?: boolean;
  cellClass?: (params: CellClassParams) => string | undefined;
  onRowSelect: (id: number) => void;
  onRowDeselect: (id: number) => void;
  onRowExpand?: null | ((id: number) => void);
  onBack?: () => void;
  isCellEditable?: (row: R, col: ColDef) => boolean;
  isCellSelectable?: (row: R, col: ColDef) => boolean;
  // Props Passed to the Primary Grid
  manager: RowManager<R, M, G, P>;
  groups?: G[];
  groupParams?: GroupProps<R, G>;
  frameworkComponents?: { [key: string]: any };
  sizeColumnsToFit?: boolean | undefined;
  search: string;
  processCellForClipboard?: { [key in keyof R]?: (row: R) => any };
  rowRefreshRequired?: (existing: R, row: R) => boolean;
  onRowUpdate: (payload: Table.RowChange<R>) => void;
  onRowBulkUpdate?: (payload: Table.RowChange<R>[]) => void;
  onRowAdd: () => void;
  onRowDelete: (row: R) => void;
}
