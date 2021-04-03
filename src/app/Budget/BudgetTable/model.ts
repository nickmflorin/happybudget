import { ColDef, CellClassParams, RowNode, GridOptions } from "ag-grid-community";
import Mapping from "model/tableMappings";

export interface GetExportValueParams {
  node: RowNode;
  colDef: ColDef;
  value: string | undefined;
}

export type ExportValueGetters = { [key: string]: (params: GetExportValueParams) => string };

export interface GroupProps<R extends Table.Row<G, C>, G extends IGroup<any>, C extends Model = UnknownModel> {
  onGroupRows: (rows: R[]) => void;
  onDeleteGroup: (group: G) => void;
  onEditGroup: (group: G) => void;
  onRowRemoveFromGroup: (row: R) => void;
}

export interface BudgetTableProps<
  R extends Table.Row<G, C>,
  M extends Model,
  G extends IGroup<any>,
  P extends Http.IPayload = Http.IPayload,
  C extends Model = UnknownModel
> extends GridOptions {
  bodyColumns: ColDef[];
  calculatedColumns?: ColDef[];
  mapping: Mapping<R, M, G, P, C>;
  data: M[];
  groups?: G[];
  placeholders?: R[];
  selected?: number[];
  identifierField: string;
  identifierFieldHeader: string;
  identifierFieldParams?: Partial<ColDef>;
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
  highlightedNonEditableCells?: (keyof R)[];
  nonHighlightedNonEditableCells?: (keyof R)[];
  groupParams?: GroupProps<R, G, C>;
  loading?: boolean;
  cellClass?: (params: CellClassParams) => string | undefined;
  rowRefreshRequired?: (existing: R, row: R) => boolean;
  onSearch: (value: string) => void;
  onRowSelect: (id: number) => void;
  onRowDeselect: (id: number) => void;
  onRowUpdate: (payload: Table.RowChange) => void;
  onRowBulkUpdate?: (payload: Table.RowChange[]) => void;
  onRowAdd: () => void;
  onRowDelete: (row: R) => void;
  onRowExpand?: (id: number) => void;
  onSelectAll: () => void;
  isCellNonEditableHighlight?: (row: R, col: ColDef) => boolean;
  isCellEditable?: (row: R, col: ColDef) => boolean;
  isCellSelectable?: (row: R, col: ColDef) => boolean;
}
