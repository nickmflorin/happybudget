import { ColDef, CellClassParams, RowNode, GridOptions } from "ag-grid-community";
import RowManager from "lib/tabling/managers";

export interface GetExportValueParams {
  node: RowNode;
  colDef: ColDef;
  value: string | undefined;
}

export type ExportValueGetters = { [key: string]: (params: GetExportValueParams) => string };

export interface GroupProps<
  R extends Table.Row<G, C>,
  G extends Model.Group<any>,
  C extends Model.Model = Model.Model
> {
  onGroupRows: (rows: R[]) => void;
  onDeleteGroup: (group: G) => void;
  onEditGroup: (group: G) => void;
  onRowRemoveFromGroup: (row: R) => void;
}

export interface CookiesProps {
  ordering?: string;
}

export interface BudgetTableProps<
  R extends Table.Row<G, C>,
  M extends Model.Model,
  G extends Model.Group<any>,
  P extends Http.ModelPayload<M> = {},
  C extends Model.Model = Model.Model
> extends Omit<GridOptions, "processCellForClipboard"> {
  bodyColumns: ColDef[];
  calculatedColumns?: ColDef[];
  manager: RowManager<R, M, G, P, C>;
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
  exportFileName?: string;
  nonEditableCells?: (keyof R)[];
  groupParams?: GroupProps<R, G, C>;
  cookies?: CookiesProps;
  loading?: boolean;
  sizeColumnsToFit?: boolean;
  renderFlag?: boolean;
  processCellForClipboard?: { [key in keyof R]?: (row: R) => any };
  cellClass?: (params: CellClassParams) => string | undefined;
  rowRefreshRequired?: (existing: R, row: R) => boolean;
  onSearch: (value: string) => void;
  onRowSelect: (id: number) => void;
  onRowDeselect: (id: number) => void;
  onRowUpdate: (payload: Table.RowChange<R>) => void;
  onRowBulkUpdate?: (payload: Table.RowChange<R>[]) => void;
  onRowAdd: () => void;
  onRowDelete: (row: R) => void;
  onRowExpand?: (id: number) => void;
  onBack?: () => void;
  onSelectAll: () => void;
  isCellEditable?: (row: R, col: ColDef) => boolean;
  isCellSelectable?: (row: R, col: ColDef) => boolean;
}
