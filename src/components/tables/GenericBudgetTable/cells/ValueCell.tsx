import { useState, useEffect } from "react";

import { isNil, filter } from "lodash";

import { CloseCircleOutlined } from "@ant-design/icons";
import { ICellRendererParams, RowNode, ColDef } from "ag-grid-community";

interface ValueCellProps extends ICellRendererParams {
  value: string | number | null;
  node: RowNode;
  colDef: ColDef;
  formatter?: (value: string | number) => string | number | null;
}

const ValueCell = ({ value, node, colDef, formatter }: ValueCellProps): JSX.Element => {
  const [cellErrors, setCellErrors] = useState<Table.ICellError[]>([]);
  const [cellValue, setCellValue] = useState<string | number | null>(null);

  useEffect(() => {
    if (!isNil(value)) {
      if (!isNil(formatter)) {
        setCellValue(formatter(value));
      } else {
        setCellValue(value);
      }
    } else {
      setCellValue(value);
    }
  }, [value, formatter]);

  useEffect(() => {
    if (!isNil(colDef.field)) {
      setCellErrors(
        filter(
          node.data.meta.errors,
          (error: Table.ICellError) => error.field === colDef.field && error.id === node.data.id
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
        {cellValue}
      </div>
    );
  } else {
    return <>{cellValue}</>;
  }
};

export default ValueCell;
