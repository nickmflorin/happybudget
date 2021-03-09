import { useState, useEffect } from "react";

import { isNil, filter } from "lodash";

import { CloseCircleOutlined } from "@ant-design/icons";
import { ICellRendererParams, RowNode, ColDef } from "ag-grid-community";

interface ValueCellProps extends ICellRendererParams {
  value: string | number | null;
  node: RowNode;
  colDef: ColDef;
}

const ValueCell = ({ value, node, colDef }: ValueCellProps): JSX.Element => {
  const [cellErrors, setCellErrors] = useState<Table.ICellError<any>[]>([]);

  useEffect(() => {
    if (!isNil(colDef.field)) {
      setCellErrors(
        filter(
          node.data.meta.errors,
          (error: Table.ICellError<any>) => error.field === colDef.field && error.id === node.data.id
        )
      );
    }
  }, [node.data.meta.errors, node.data.id, colDef]);

  // TODO: For now, we will just use the first error.
  if (!isNil(value) && cellErrors.length !== 0) {
    return (
      <div>
        <div className={"error-container"}>
          <CloseCircleOutlined className={"icon--error"} />
          <div className={"text-error"}>{cellErrors[0].error}</div>
        </div>
        {!isNil(value) && value}
      </div>
    );
  } else {
    return <>{!isNil(value) && value}</>;
  }
};

export default ValueCell;
