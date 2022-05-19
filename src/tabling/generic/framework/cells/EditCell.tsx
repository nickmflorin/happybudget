import React, { useMemo } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { tabling } from "lib";

import { Icon } from "components";
import { IconButton } from "components/buttons";

export interface EditCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.CellProps<R, M, S, null, Table.ActionColumn<R, M>> {
  readonly editColumnConfig: Table.EditColumnRowConfig<R, Table.NonPlaceholderBodyRow<R>>[];
  readonly alwaysShow?: (row: Table.BodyRow<R>) => boolean;
}

const Action = <
  R extends Table.RowData,
  RW extends Table.NonPlaceholderBodyRow<R> = Table.NonPlaceholderBodyRow<R>
>(props: {
  readonly config: Table.EditColumnRowConfig<R, RW>;
  readonly hovered: boolean;
  readonly row: RW;
  readonly iconStyle?: React.CSSProperties;
}): JSX.Element => {
  const icon: IconProp = useMemo(() => {
    const map: { [key in Table.EditRowActionBehavior]: IconProp } = {
      edit: "pencil",
      expand: "expand-alt"
    };
    return map[props.config.behavior];
  }, [props.config.behavior]);

  const disabled = useMemo(() => {
    if (!isNil(props.config.disabled)) {
      return typeof props.config.disabled === "function"
        ? props.config.disabled(props.row, props.hovered)
        : props.config.disabled;
    }
    return false;
  }, [props.config.disabled, props.row]);

  const tooltip = useMemo(() => {
    if (!isNil(props.config.tooltip)) {
      return typeof props.config.tooltip === "function"
        ? props.config.tooltip(props.row, { hovered: props.hovered, disabled })
        : props.config.tooltip;
    }
    const defaultTooltipMap: { [key in Table.EditRowActionBehavior]: string } = {
      edit: "Edit",
      expand: "Expand"
    };
    return defaultTooltipMap[props.config.behavior];
  }, [props.config.behavior, props.config.tooltip, disabled, props.row]);

  return (
    <IconButton
      className={classNames("ag-grid-action-button", {
        "fake-disabled": disabled
      })}
      iconSize={"xsmall"}
      size={"xsmall"}
      icon={<Icon icon={icon} weight={"regular"} style={props.iconStyle} />}
      onClick={() => props.config.action(props.row, props.hovered)}
      tooltip={{ content: tooltip, placement: "bottom", overlayClassName: "tooltip-lower" }}
    />
  );
};

const EditCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>({
  editColumnConfig,
  alwaysShow,
  node,
  ...props
}: EditCellProps<R, M, S>): JSX.Element => {
  // This cell renderer will only be allowed if the row is of type model.
  const row: Table.EditableRow<R> = node.data;

  const config: Table.EditColumnRowConfig<R, Table.NonPlaceholderBodyRow<R>> | null = useMemo(() => {
    return tabling.columns.getEditColumnRowConfig<R, Table.NonPlaceholderBodyRow<R>>(editColumnConfig, row);
  }, [row.rowType]);

  const rowIsHovered = () => {
    const parent = props.eGridCell.parentElement;
    if (!isNil(parent)) {
      const cls = parent.getAttribute("class");
      return cls?.indexOf("ag-row-hover") !== -1;
    }
    return false;
  };

  const showAlways = useMemo(() => {
    return !isNil(alwaysShow) && alwaysShow(row);
  }, [alwaysShow, row]);

  const colorDef = useMemo<Table.RowColorDef>(() => {
    return props.getRowColorDef(row);
  }, [row]);

  if (!isNil(config)) {
    if (config.behavior === "expand" && tabling.rows.isModelRow(row)) {
      if (showAlways || rowIsHovered()) {
        return <Action config={config} hovered={rowIsHovered()} row={row} />;
      }
    } else if (config.behavior === "edit") {
      if (showAlways || rowIsHovered()) {
        return (
          <Action
            config={config}
            iconStyle={tabling.rows.isGroupRow(row) && !isNil(colorDef.color) ? { color: colorDef.color } : {}}
            hovered={rowIsHovered()}
            row={row}
          />
        );
      }
    }
  }
  return <span></span>;
};

export default React.memo(EditCell) as typeof EditCell;
