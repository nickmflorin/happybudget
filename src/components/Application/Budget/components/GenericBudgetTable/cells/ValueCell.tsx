import { isNil } from "lodash";

import { LockOutlined } from "@ant-design/icons";
import { ICellRendererParams, RowNode, ColDef } from "ag-grid-community";

interface ValueCellProps extends ICellRendererParams {
  isCellEditable: (row: RowNode, col: ColDef) => boolean;
  onDeselect: (id: number | string) => void;
  value: Redux.ICell<any>;
  colDef: ColDef;
}

const ValueCell = ({ isCellEditable, node, value, colDef }: ValueCellProps): JSX.Element => {
  if (!isCellEditable(node, colDef)) {
    return (
      <div>
        <LockOutlined className={"icon--lock"} />
        {!isNil(value) && value.value}
      </div>
    );
  } else {
    return <>{!isNil(value) && value.value}</>;
  }
};

export default ValueCell;
