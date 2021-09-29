import { isNil } from "lodash";

import { Icon, ShowHide } from "components";
import { IconButton } from "components/buttons";

export interface ExpandCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> extends Table.CellProps<R, M, S, null> {
  readonly onExpand: (row: Table.ModelRow<R>) => void;
  readonly rowCanExpand?: (row: Table.ModelRow<R>) => boolean;
  readonly alwaysShow?: (row: Table.ModelRow<R>) => boolean;
  readonly tooltip?: string;
  readonly cannotExpandTooltip?: string;
}

/* eslint-disable indent */
const ExpandCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>({
  rowCanExpand,
  onExpand,
  alwaysShow,
  tooltip,
  cannotExpandTooltip,
  node,
  ...props
}: ExpandCellProps<R, M, S>): JSX.Element => {
  // This cell renderer will only be allowed if the row is of type model.
  const row: Table.ModelRow<R> = node.data;

  const rowIsHovered = () => {
    const parent = props.eGridCell.parentElement;
    if (!isNil(parent)) {
      const cls = parent.getAttribute("class");
      return cls?.indexOf("ag-row-hover") !== -1;
    }
    return false;
  };

  // Note: Wrapping the cell in a <div> helps alleviate some issues with AG Grid.
  if (isNil(rowCanExpand) || rowCanExpand(row) === true) {
    if (!isNil(alwaysShow) && alwaysShow(row)) {
      return (
        <IconButton
          className={"ag-grid-action-button"}
          size={"small"}
          icon={<Icon icon={"expand-alt"} weight={"solid"} />}
          onClick={() => onExpand(row)}
          tooltip={{ title: "Expand", placement: "bottom", overlayClassName: "tooltip-lower" }}
        />
      );
    } else {
      return (
        <div>
          <ShowHide show={rowIsHovered()}>
            <IconButton
              className={"ag-grid-action-button"}
              size={"small"}
              icon={<Icon icon={"expand-alt"} weight={"solid"} />}
              onClick={() => onExpand(row)}
              tooltip={{ title: "Expand", placement: "bottom", overlayClassName: "tooltip-lower" }}
            />
          </ShowHide>
        </div>
      );
    }
  } else {
    return (
      <div>
        <ShowHide show={rowIsHovered()}>
          <IconButton
            className={"ag-grid-action-button fake-disabled"}
            size={"small"}
            disabled={false}
            tooltip={
              !isNil(cannotExpandTooltip)
                ? { placement: "bottom", overlayClassName: "tooltip-lower", title: cannotExpandTooltip }
                : undefined
            }
            icon={<Icon icon={"expand-alt"} weight={"solid"} />}
          />
        </ShowHide>
      </div>
    );
  }
};

export default ExpandCell;
