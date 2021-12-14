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
> extends Table.CellProps<R, M, S, null> {
  readonly editColumnConfig: Table.EditColumnRowConfig<R>[];
  readonly alwaysShow?: (row: Table.BodyRow<R>) => boolean;
}

const Action = <
  R extends Table.RowData,
  RW extends Table.NonPlaceholderBodyRow<R> = Table.NonPlaceholderBodyRow<R>
>(props: {
  readonly config: Table.EditColumnRowConfig<R>;
  readonly hovered: boolean;
  readonly row: RW;
  readonly iconStyle?: React.CSSProperties;
}): JSX.Element => {
  const icon: IconProp = useMemo(() => {
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
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

  const hidden = useMemo(() => {
    if (!isNil(props.config.hidden)) {
      return typeof props.config.hidden === "function"
        ? props.config.hidden(props.row, props.hovered)
        : props.config.hidden;
    }
    return false;
  }, [props.config.hidden, props.row]);

  const tooltip = useMemo(() => {
    if (!isNil(props.config.tooltip)) {
      return typeof props.config.tooltip === "function"
        ? props.config.tooltip(props.row, { hovered: props.hovered, disabled })
        : props.config.tooltip;
    }
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    const defaultTooltipMap: { [key in Table.EditRowActionBehavior]: string } = {
      edit: "Edit",
      expand: "Expand"
    };
    return defaultTooltipMap[props.config.behavior];
  }, [props.config.behavior, props.config.tooltip, disabled, props.row]);

  if (hidden) {
    return <span></span>;
  }
  return (
    <IconButton
      className={classNames("ag-grid-action-button", {
        "fake-disabled": disabled
      })}
      size={"small"}
      icon={<Icon icon={icon} weight={"regular"} style={props.iconStyle} />}
      onClick={() => props.config.action(props.row, props.hovered)}
      tooltip={{ title: tooltip, placement: "bottom", overlayClassName: "tooltip-lower" }}
    />
  );
};

/* eslint-disable indent */
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

  const config: Table.EditColumnRowConfig<R> | null = useMemo(() => {
    let cfg: Table.EditColumnRowConfig<R> | null = null;
    for (let i = 0; i < editColumnConfig.length; i++) {
      if (editColumnConfig[i].conditional(row)) {
        cfg = editColumnConfig[i];
        break;
      }
    }
    return cfg;
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
    if (config.behavior === "expand" && tabling.typeguards.isModelRow(row)) {
      if (showAlways || rowIsHovered()) {
        return <Action config={config} hovered={rowIsHovered()} row={row} />;
      }
    } else if (config.behavior === "edit") {
      if (showAlways || rowIsHovered()) {
        return (
          <Action
            config={config}
            iconStyle={tabling.typeguards.isGroupRow(row) && !isNil(colorDef.color) ? { color: colorDef.color } : {}}
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
