import { ICellRendererParams, RowNode } from "ag-grid-community";

interface IdentifierCellProps extends ICellRendererParams {
  value: string | number | null;
  node: RowNode;
}

const IdentifierCell = <R extends Table.Row<any>>({ value, node }: IdentifierCellProps): JSX.Element => {
  const row: R = node.data;
  if (row.meta.isGroupFooter === true && row.group !== null) {
    return <span>{row.group.name}</span>;
  }
  return <span>{value}</span>;
};

export default IdentifierCell;
