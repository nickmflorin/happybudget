import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpandAlt } from "@fortawesome/pro-solid-svg-icons";

import { ShowHide } from "components";
import { IconButton } from "components/buttons";

interface ExpandCellProps<R extends Table.Row, M extends Model.Model> extends Table.CellProps<R, M, null> {
  readonly onClick: (id: number) => void;
  readonly rowCanExpand?: (row: R) => boolean;
  readonly tooltip?: string;
  readonly cannotExpandTooltip?: string;
}

const ExpandCell = <R extends Table.Row, M extends Model.Model>({
  rowCanExpand,
  onClick,
  tooltip,
  cannotExpandTooltip,
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
    return (
      <div>
        <ShowHide show={rowIsHovered()}>
          <IconButton
            className={"ag-grid-expand-button"}
            size={"small"}
            icon={<FontAwesomeIcon className={"icon"} icon={faExpandAlt} />}
            onClick={() => onClick(node.data.id)}
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
            icon={<FontAwesomeIcon className={"icon"} icon={faExpandAlt} />}
          />
        </ShowHide>
      </div>
    );
  }
};

export default ExpandCell;
