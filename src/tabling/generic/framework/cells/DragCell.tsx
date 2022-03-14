import React, { useRef, useEffect } from "react";
import { isNil } from "lodash";

import { tabling } from "lib";
import { Icon } from "components";

import { Cell } from "./generic";

const DragCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: Table.CellProps<R, M, S, null, Table.ActionColumn<R, M>>
): JSX.Element => {
  const row: Table.BodyRow<R> = props.node.data;
  const iconRef = useRef(null);

  useEffect(() => {
    if (!isNil(iconRef.current) && tabling.rows.isModelRow(row)) {
      props.registerRowDragger(iconRef.current);
    }
  }, [iconRef, row.rowType]);

  if (tabling.rows.isModelRow(row)) {
    return (
      <Cell {...props}>
        <Icon ref={iconRef} className={"icon--row-drag"} weight={"solid"} icon={"grip-dots-vertical"} />
      </Cell>
    );
  }
  return <span></span>;
};

export default React.memo(DragCell);
