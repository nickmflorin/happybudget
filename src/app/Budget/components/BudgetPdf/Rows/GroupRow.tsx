import { useMemo } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { budgeting } from "lib";

import { RowExplicitCellProps } from "../Cells/Cell";
import BodyRow, { BodyRowProps } from "./BodyRow";

interface GroupRowProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
  extends BodyRowProps<R, M, Table.GroupRow<R>> {
  readonly cellProps?: RowExplicitCellProps<R, M>;
}

const GroupRow = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: GroupRowProps<R, M>
): JSX.Element => {
  const cellStyle = useMemo(() => {
    if (!isNil(props.row)) {
      const colorDef = budgeting.models.getGroupColorDefinition(props.row);
      return {
        backgroundColor: !isNil(colorDef.backgroundColor) ? colorDef.backgroundColor : "#EFEFEF"
      };
    }
    return {};
  }, [props.row]);

  const cellTextStyle = useMemo(() => {
    if (!isNil(props.row)) {
      const colorDef = budgeting.models.getGroupColorDefinition(props.row);
      return {
        color: !isNil(colorDef.color) ? colorDef.color : "#424242"
      };
    }
    return {};
  }, [props.row]);

  return (
    <BodyRow
      {...props}
      row={props.row}
      style={{ ...cellStyle, ...props.style }}
      className={classNames("group-tr", props.className)}
      cellProps={{
        ...props.cellProps,
        className: [
          props.cellProps?.className,
          (params: Table.PdfCellCallbackParams<R, M>) => {
            /* We have to add a borderLeft to the first indented column for the
						   Group Row because the Row itself will not have a borderLeft
							 attribute on it and the Row starts one column to the right. */
            /* eslint-disable indent */
            return params.indented === false ? "group-tr-td" : params.colIndex === 0 ? "td-border-left" : "";
          }
        ],
        // style: [props.cellProps?.style, cellStyle],
        textClassName: ["group-tr-td-text", props.cellProps?.textClassName],
        textStyle: [cellTextStyle, props.cellProps?.textStyle]
      }}
    />
  );
};

export default GroupRow;
