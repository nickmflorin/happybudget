import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpandAlt } from "@fortawesome/pro-solid-svg-icons";

import { ShowHide } from "components";
import { IconButton } from "components/buttons";

interface ExpandCellProps<R extends BudgetTable.Row, M extends Model.Model> extends BudgetTable.CellProps<R, M, null> {
  onClick: (id: number) => void;
  rowCanExpand?: (row: R) => boolean;
}

const ExpandCell = <R extends BudgetTable.Row, M extends Model.Model>({
  rowCanExpand,
  onClick,
  node,
  ...props
}: ExpandCellProps<R, M>): JSX.Element => {
  const row: R = node.data;

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
    if (!isNil(row.meta.children) && row.meta.children.length !== 0) {
      return (
        <IconButton
          className={"ag-grid-expand-button"}
          size={"small"}
          icon={<FontAwesomeIcon icon={faExpandAlt} />}
          onClick={() => onClick(node.data.id)}
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
              icon={<FontAwesomeIcon icon={faExpandAlt} />}
              onClick={() => onClick(node.data.id)}
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
            icon={<FontAwesomeIcon icon={faExpandAlt} />}
            tooltip={{ title: "Expand", placement: "bottom", overlayClassName: "Fill in account to expand" }}
          />
        </ShowHide>
      </div>
    );
  }
};

export default ExpandCell;
