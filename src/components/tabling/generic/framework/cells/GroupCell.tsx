import { useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil, find, filter } from "lodash";
import { createSelector } from "reselect";

import { hooks, tabling } from "lib";

import { IconButton } from "components/buttons";
import { Cell, ValueCell } from "components/tabling/generic/framework/cells";

interface GroupCellProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
> extends Table.ValueCellProps<R, M, G, S> {
  readonly onEdit?: (group: Table.GroupRow<R>) => void;
}

/* eslint-disable indent */
const GroupCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>({
  onEdit,
  ...props
}: GroupCellProps<R, M, G, S>): JSX.Element => {
  const row: Table.Row<R, M> = props.node.data;
  const groupRowSelector = createSelector(
    [(state: Application.Store) => props.selector(state).data],
    (data: Table.Row<R, M>[]) =>
      filter(data, (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[]
  );
  const groupRows = useSelector(groupRowSelector);

  const groupRow = useMemo<Table.GroupRow<R> | null>((): Table.GroupRow<R> | null => {
    const groupId = tabling.typeguards.isGroupRow(row) ? row.group : null;
    return isNil(groupId)
      ? null
      : (find(groupRows, { group: groupId } as any) as Table.GroupRow<R> | undefined) || null;
  }, [row, hooks.useDeepEqualMemo(groupRows)]);

  const colorDef = useMemo<Table.RowColorDef>(() => {
    return props.getRowColorDef(row);
  }, [row]);

  return !isNil(groupRow) ? (
    <Cell {...props}>
      <div style={{ display: "flex" }}>
        <span>{`${groupRow.name} (${groupRow.children.length} Line Items)`}</span>
        <IconButton
          className={"btn--edit-group"}
          size={"xxsmall"}
          icon={"edit"}
          onClick={() => onEdit?.(groupRow)}
          style={!isNil(colorDef.color) ? { color: colorDef.color } : {}}
        />
      </div>
    </Cell>
  ) : (
    <ValueCell {...props} />
  );
};

export default GroupCell;
