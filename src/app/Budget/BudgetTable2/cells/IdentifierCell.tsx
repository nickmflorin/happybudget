import { ICellRendererParams, RowNode } from "ag-grid-community";
import { isNil } from "lodash";

interface IdentifierCellProps extends ICellRendererParams {
  value: string | number | null;
  node: RowNode;
}

const IdentifierCell = <R extends Table.Row>({ value, node }: IdentifierCellProps): JSX.Element => {
  const row: R = node.data;
  if (row.meta.isGroupFooter === true && !isNil(row.group)) {
    return <span>{row.group.name}</span>;
  }
  return <span>{value}</span>;
};

export default IdentifierCell;
