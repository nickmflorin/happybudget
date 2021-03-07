import { LockOutlined } from "@ant-design/icons";
import { ICellRendererParams, RowNode, ColDef } from "ag-grid-community";

interface ValueCellProps extends ICellRendererParams {
  isCellEditable: (row: RowNode, col: ColDef) => boolean;
  onDeselect: (id: number | string) => void;
  value: any;
  colDef: ColDef;
}

const ValueCell = ({ isCellEditable, node, value, colDef }: ValueCellProps): JSX.Element => {
  if (!isCellEditable(node, colDef)) {
    return (
      <div>
        <LockOutlined className={"icon--lock"} />
        {value}
      </div>
    );
  } else {
    return <>{value}</>;
  }
};

export default ValueCell;
