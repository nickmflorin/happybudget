import { isNil } from "lodash";

import { Icon, ShowHide } from "components";
import { IconButton } from "components/buttons";

interface ExpandCellProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
> extends Table.CellProps<R, M, G, S, null> {
  readonly onClick: (row: Table.ModelRow<R>) => void;
  readonly rowCanExpand?: (row: Table.ModelRow<R>) => boolean;
  readonly tooltip?: string;
  readonly cannotExpandTooltip?: string;
}

/* eslint-disable indent */
const ExpandCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>({
  rowCanExpand,
  onClick,
  tooltip,
  cannotExpandTooltip,
  node,
  ...props
}: ExpandCellProps<R, M, G, S>): JSX.Element => {
  // This cell renderer will only be allowed if the row is of type model.
  const row: Table.ModelRow<R, M> = node.data;

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
    return (
      <div>
        <ShowHide show={rowIsHovered()}>
          <IconButton
            className={"ag-grid-expand-button"}
            size={"small"}
            icon={<Icon icon={"expand-alt"} weight={"solid"} />}
            onClick={() => onClick(row)}
            tooltip={{ placement: "bottom", overlayClassName: "tooltip-lower", title: tooltip || "Expand" }}
          />
        </ShowHide>
      </div>
    );
  } else {
    return (
      <div>
        <ShowHide show={rowIsHovered()}>
          <IconButton
            className={"ag-grid-expand-button fake-disabled"}
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
