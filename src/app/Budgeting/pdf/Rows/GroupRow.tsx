import { useMemo } from "react";
import { isNil, reduce } from "lodash";
import classNames from "classnames";

import { getGroupColorDefinition } from "lib/model/util";

import { RowProps } from "./Row";
import BodyRow from "./BodyRow";

const GroupRow = <R extends PdfTable.Row, M extends Model.Model>(
  props: Omit<RowProps<R, M>, "row"> & { group: Model.Group }
): JSX.Element => {
  const rowStyle = useMemo(() => {
    const colorDef = getGroupColorDefinition(props.group);
    return {
      backgroundColor: !isNil(colorDef.backgroundColor) ? colorDef.backgroundColor : "#EFEFEF"
    };
  }, [props.group]);

  const cellTextStyle = useMemo(() => {
    const colorDef = getGroupColorDefinition(props.group);
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
      style={{ ...rowStyle, ...props.style }}
      className={classNames("group-tr", props.className)}
      cellProps={{ border: false, textClassName: "group-tr-td-text", textStyle: cellTextStyle }}
    />
  );
};

export default GroupRow;
