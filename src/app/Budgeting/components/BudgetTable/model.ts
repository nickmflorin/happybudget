import { TooltipPropsWithTitle } from "antd/lib/tooltip";
import { ColDef, CellClassParams, RowNode, GridOptions } from "@ag-grid-community/core";
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
}

export interface CookiesProps {
  ordering?: string;
}

export interface BudgetTableMenuProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  columns: ColDef[];
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
  bodyColumns: ColDef[];
  calculatedColumns?: ColDef[];
  manager: RowManager<R, M, G, P>;
  data: M[];
  groups?: G[];
  placeholders?: R[];
  selected?: number[];
  identifierField: string;
  identifierFieldHeader: string;
  identifierColumn?: Partial<ColDef>;
  actionColumn?: Partial<ColDef>;
  indexColumn?: Partial<ColDef>;
  expandColumn?: Partial<ColDef>;
  tableFooterIdentifierValue?: string | null;
  budgetFooterIdentifierValue?: string | null;
  tableTotals?: { [key: string]: any };
  budgetTotals?: { [key: string]: any };
  search: string;
  saving: boolean;
  loadingBudget?: boolean;
  frameworkComponents?: { [key: string]: any };
  getExportValue?: ExportValueGetters;
  exportable?: boolean;
  exportFileName?: string;
  nonEditableCells?: (keyof R)[];
  groupParams?: GroupProps<R, G>;
  cookies?: CookiesProps;
  loading?: boolean;
  sizeColumnsToFit?: boolean;
  renderFlag?: boolean;
  processCellForClipboard?: { [key in keyof R]?: (row: R) => any };
  cellClass?: (params: CellClassParams) => string | undefined;
  rowRefreshRequired?: (existing: R, row: R) => boolean;
  onRowSelect: (id: number) => void;
  onRowDeselect: (id: number) => void;
  onRowUpdate: (payload: Table.RowChange<R>) => void;
  onRowBulkUpdate?: (payload: Table.RowChange<R>[]) => void;
  onRowAdd: () => void;
  onRowDelete: (row: R) => void;
  onRowExpand?: (id: number) => void;
  onBack?: () => void;
  isCellEditable?: (row: R, col: ColDef) => boolean;
  isCellSelectable?: (row: R, col: ColDef) => boolean;
}
