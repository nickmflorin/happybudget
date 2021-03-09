import { isNil } from "lodash";

import { CloseCircleOutlined } from "@ant-design/icons";
import { ICellRendererParams } from "ag-grid-community";

interface ValueCellProps extends ICellRendererParams {
  value: string | number | null;
}

const ValueCell = ({ value }: ValueCellProps): JSX.Element => {
  const error = undefined;
  if (!isNil(value) && !isNil(error)) {
    return (
      <div>
        <div className={"error-container"}>
          <div className={"text-error"}>{error}</div>
          <CloseCircleOutlined className={"icon--error"} />
        </div>
        {!isNil(value) && value}
      </div>
    );
  } else {
    return <>{!isNil(value) && value}</>;
  }
};

export default ValueCell;
