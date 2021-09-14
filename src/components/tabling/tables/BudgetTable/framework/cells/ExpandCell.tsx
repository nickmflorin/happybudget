import { isNil } from "lodash";

import { Icon, ShowHide } from "components";
import { IconButton } from "components/buttons";

interface ExpandCellProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
> extends Table.CellProps<R, M, G, S, null> {
  onClick: (row: Table.ModelRow<R, M>) => void;
  rowCanExpand?: (row: Table.ModelRow<R, M>) => boolean;
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
    if (!isNil(row.children) && row.children.length !== 0) {
      return (
        <IconButton
          className={"ag-grid-expand-button"}
          size={"small"}
          icon={<Icon icon={"expand-alt"} weight={"solid"} />}
          onClick={() => onClick(row)}
          tooltip={{ title: "Expand", placement: "bottom", overlayClassName: "tooltip-lower" }}
        />
      );
    } else {
      return (
        <div>
          <ShowHide show={rowIsHovered()}>
            <IconButton
              className={"ag-grid-expand-button"}
              size={"small"}
              icon={<Icon icon={"expand-alt"} weight={"solid"} />}
              onClick={() => onClick(row)}
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
            className={"ag-grid-expand-button fake-disabled"}
            size={"small"}
            disabled={false}
            icon={<Icon icon={"expand-alt"} weight={"solid"} />}
            tooltip={{ title: "Expand", placement: "bottom", overlayClassName: "Fill in account to expand" }}
          />
        </ShowHide>
      </div>
    );
  }
};

export default ExpandCell;
