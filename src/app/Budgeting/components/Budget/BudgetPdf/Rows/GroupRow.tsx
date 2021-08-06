import { useMemo } from "react";
import { isNil, reduce } from "lodash";
import classNames from "classnames";

import { model } from "lib";

import { CellProps } from "../Cells/Cell";
import { RowProps } from "./Row";
import BodyRow from "./BodyRow";

const GroupRow = <R extends Table.Row, M extends Model.Model>(
  props: Omit<RowProps<R, M>, "row"> & {
    group: Model.Group;
    readonly cellProps?: Omit<CellProps<R, M>, "column" | "location" | "row" | "debug" | "isHeader">;
  }
): JSX.Element => {
  const cellStyle = useMemo(() => {
    const colorDef = model.util.getGroupColorDefinition(props.group);
    return {
      backgroundColor: !isNil(colorDef.backgroundColor) ? colorDef.backgroundColor : "#EFEFEF"
    };
  }, [props.group]);

  const cellTextStyle = useMemo(() => {
    const colorDef = model.util.getGroupColorDefinition(props.group);
    return {
      color: !isNil(colorDef.color) ? colorDef.color : "#424242"
    };
  }, [props.group]);

  const groupRow = useMemo((): R => {
    return reduce(
      props.columns,
      (obj: { [key: string]: any }, col: PdfTable.Column<R, M>, index: number) => {
        if (props.columns.length === 1 || index === 1) {
          obj[col.field as string] = props.group.name;
        } else if (col.isCalculated === true) {
          obj[col.field as string] = null;
          if (!isNil(props.group[col.field as keyof Model.Group])) {
            obj[col.field as string] = props.group[col.field as keyof Model.Group];
          }
        } else {
          obj[col.field as string] = null;
        }
        return obj;
      },
      {}
    ) as R;
  }, [props.columns, props.group]);

  return (
    <BodyRow
      {...props}
      row={groupRow}
      style={{ ...cellStyle, ...props.style }}
      className={classNames("group-tr", props.className)}
      cellProps={{
        ...props.cellProps,
        className: [
          props.cellProps?.className,
          (params: PdfTable.CellCallbackParams<R, M>) => {
            // We have to add a borderLeft to the first indented column for the Group Row
            // because the Row itself will not have a borderLeft attribute on it and the
            // Row starts one column to the right.
            /* eslint-disable indent */
            return params.indented === false ? "group-tr-td" : params.location.colIndex === 0 ? "td-border-left" : "";
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
