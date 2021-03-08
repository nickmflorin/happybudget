import { isNil } from "lodash";

import { CloseCircleOutlined } from "@ant-design/icons";
import { ICellRendererParams } from "ag-grid-community";

interface ValueCellProps extends ICellRendererParams {
  value: Redux.ICell<any>;
}

const ValueCell = ({ value }: ValueCellProps): JSX.Element => {
  if (!isNil(value) && !isNil(value.error)) {
    return (
      <div>
        <div className={"error-container"}>
          <div className={"text-error"}>{value.error}</div>
          <CloseCircleOutlined className={"icon--error"} />
        </div>
        {!isNil(value) && value.value}
      </div>
    );
  } else {
    return <>{!isNil(value) && value.value}</>;
  }
};

export default ValueCell;
