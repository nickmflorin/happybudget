import { useMemo } from "react";
import { isNil } from "lodash";

import { tabling } from "lib";

import { IconButton } from "components/buttons";
import { Cell, ValueCell } from "components/tabling/generic/framework/cells";

interface GroupCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> extends Table.ValueCellProps<R, M, S> {
  readonly onEdit?: (group: Table.GroupRow<R>) => void;
}

/* eslint-disable indent */
const GroupCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>({
  onEdit,
  ...props
}: GroupCellProps<R, M, S>): JSX.Element => {
  const row: Table.Row<R> = props.node.data;

  const colorDef = useMemo<Table.RowColorDef>(() => {
    return props.getRowColorDef(row);
  }, [row]);

  return tabling.typeguards.isGroupRow(row) ? (
    <Cell {...props}>
      <div style={{ display: "flex" }}>
        <span>{`${row.groupData.name} (${row.children.length} Line Items)`}</span>
        <IconButton
          className={"btn--edit-group"}
          size={"xxsmall"}
          icon={"edit"}
          onClick={() => onEdit?.(row)}
          style={!isNil(colorDef.color) ? { color: colorDef.color } : {}}
        />
      </div>
    </Cell>
  ) : (
    <ValueCell {...props} />
  );
};

export default GroupCell;
