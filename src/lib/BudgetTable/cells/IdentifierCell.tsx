import { useMemo, useState, useEffect } from "react";
import classNames from "classnames";
import { isNil, filter } from "lodash";

import { CloseCircleOutlined } from "@ant-design/icons";
import { ICellRendererParams, RowNode, ColDef } from "ag-grid-community";

interface IdentifierCellProps extends ICellRendererParams {
  value: string | number | null;
  node: RowNode;
  colDef: ColDef;
  formatter?: (value: string | number) => string | number | null;
  renderRedIfNegative?: boolean;
}

const IdentifierCell = ({
  value,
  node,
  colDef,
  renderRedIfNegative = false,
  formatter
}: IdentifierCellProps): JSX.Element => {
  const [cellErrors, setCellErrors] = useState<Table.CellError[]>([]);
  const [cellValue, setCellValue] = useState<string | number | null>(null);

  const renderRed = useMemo(() => {
    if (renderRedIfNegative === true && !isNil(value)) {
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (parsed < 0) {
          return true;
        }
        return false;
      } else if (value < 0) {
        return true;
      }
      return false;
    }
  }, [value, renderRedIfNegative]);

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
    if (!isNil(colDef.field) && node.group === false) {
      setCellErrors(
        filter(
          node.data.meta.errors,
          (error: Table.CellError) => error.field === colDef.field && error.id === node.data.id
        )
      );
    }
  }, [node.data, node.group, colDef]);

  // TODO: For now, we will just use the first error.
  if (!isNil(value) && cellErrors.length !== 0) {
    return (
      <div>
        <div className={"error-container"}>
          <CloseCircleOutlined className={"icon--error"} />
          <div className={"text-error"}>{cellErrors[0].error}</div>
        </div>
        <span className={classNames({ "color--red": renderRed })}>{cellValue}</span>
      </div>
    );
  } else {
    return <span className={classNames({ "color--red": renderRed })}>{cellValue}</span>;
  }
};

export default IdentifierCell;
