import React, { useMemo } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { tabling } from "lib";

import { Icon } from "components";
import { IconButton } from "components/buttons";

export interface ExpandCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.CellProps<R, M, S, null> {
  readonly onEditRow?: (row: Table.BodyRow<R>) => void;
  readonly onExpand?: (row: Table.ModelRow<R>) => void;
  readonly rowCanExpand?: boolean | ((row: Table.ModelRow<R>) => boolean);
  readonly alwaysShow?: (row: Table.BodyRow<R>) => boolean;
  readonly tooltip?: string;
  readonly cannotExpandTooltip?: string;
  readonly expandActionBehavior?:
    | undefined
    | Table.ExpandActionBehavior
    | ((r: Table.BodyRow<R>) => Table.ExpandActionBehavior);
}

const Action = <R extends Table.RowData, RW extends Table.BodyRow<R> = Table.BodyRow<R>>(props: {
  readonly icon: IconProp;
  readonly tooltip: string;
  readonly row: RW;
  readonly disabled?: boolean;
  readonly style?: React.CSSProperties;
  readonly onClick: (row: RW) => void;
}): JSX.Element => {
  return (
    <IconButton
      className={classNames("ag-grid-action-button", {
        "fake-disabled": props.disabled
      })}
      size={"small"}
      icon={<Icon icon={props.icon} weight={"regular"} style={props.style} />}
      onClick={() => props.onClick(props.row)}
      tooltip={{ title: props.tooltip, placement: "bottom", overlayClassName: "tooltip-lower" }}
    />
  );
};

const EditAction = <R extends Table.RowData>(props: {
  readonly row: Table.BodyRow<R>;
  readonly disabled?: boolean;
  readonly style?: React.CSSProperties;
  readonly onClick: (row: Table.BodyRow<R>) => void;
}): JSX.Element => <Action {...props} icon={"pencil"} tooltip={"Edit"} />;

const ExpandAction = <R extends Table.RowData>(props: {
  readonly tooltip?: string | undefined;
  readonly disabled?: boolean;
  readonly row: Table.ModelRow<R>;
  readonly onClick: (row: Table.ModelRow<R>) => void;
}): JSX.Element => <Action {...props} tooltip={props.tooltip || "Expand"} icon={"expand-alt"} />;

/* eslint-disable indent */
const ExpandCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>({
  rowCanExpand,
  onEditRow,
  onExpand,
  alwaysShow,
  expandActionBehavior = "expand",
  tooltip,
  cannotExpandTooltip,
  node,
  ...props
}: ExpandCellProps<R, M, S>): JSX.Element => {
  // This cell renderer will only be allowed if the row is of type model.
  const row: Table.EditableRow<R> = node.data;

  const rowIsHovered = () => {
    const parent = props.eGridCell.parentElement;
    if (!isNil(parent)) {
      const cls = parent.getAttribute("class");
      return cls?.indexOf("ag-row-hover") !== -1;
    }
    return false;
  };

  const behavior: Table.ExpandActionBehavior = useMemo(() => {
    return typeof expandActionBehavior === "function" ? expandActionBehavior(row) : expandActionBehavior;
  }, [expandActionBehavior, row]);

  const showAlways = useMemo(() => {
    return !isNil(alwaysShow) && alwaysShow(row);
  }, [alwaysShow, row]);

  const colorDef = useMemo<Table.RowColorDef>(() => {
    return props.getRowColorDef(row);
  }, [row]);

  if (behavior === "expand" && tabling.typeguards.isModelRow(row) && !isNil(onExpand)) {
    if (
      isNil(rowCanExpand) ||
      (typeof rowCanExpand === "boolean" && rowCanExpand !== false) ||
      (typeof rowCanExpand === "function" && rowCanExpand(row) === true)
    ) {
      if (showAlways || rowIsHovered()) {
        return <ExpandAction onClick={onExpand} row={row} />;
      }
      return <span></span>;
    } else if (rowIsHovered() && rowCanExpand !== false) {
      return <ExpandAction onClick={onExpand} disabled={true} row={row} tooltip={cannotExpandTooltip} />;
    } else {
      return <span></span>;
    }
  } else if (behavior === "edit" && !isNil(onEditRow)) {
    if (showAlways || rowIsHovered()) {
      return (
        <EditAction
          onClick={onEditRow}
          row={row}
          style={tabling.typeguards.isGroupRow(row) && !isNil(colorDef.color) ? { color: colorDef.color } : {}}
        />
      );
    }
    return <span></span>;
  } else {
    return <span></span>;
  }
};

export default React.memo(ExpandCell) as typeof ExpandCell;
