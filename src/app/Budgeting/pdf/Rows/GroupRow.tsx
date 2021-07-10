import { useMemo } from "react";
import { isNil, reduce } from "lodash";
import classNames from "classnames";

import { getGroupColorDefinition } from "lib/model/util";

import { RowProps } from "./Row";
import BodyRow from "./BodyRow";

const GroupRow = <R extends Table.PdfRow, M extends Model.Model>(
  props: Omit<RowProps<R, M>, "row"> & { group: Model.BudgetGroup }
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
      (obj: { [key: string]: any }, col: Table.PdfColumn<R, M>, index: number) => {
        if (props.columns.length === 1 || index === 2) {
          obj[col.field] = props.group.name;
        } else {
          obj[col.field] = null;
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
      cellProps={{ formatting: false, border: false, textClassName: "group-tr-td-text", textStyle: cellTextStyle }}
    />
  );
};

export default GroupRow;
