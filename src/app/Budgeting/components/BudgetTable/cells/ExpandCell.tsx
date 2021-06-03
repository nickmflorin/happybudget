import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpandAlt } from "@fortawesome/pro-solid-svg-icons";

import { ICellRendererParams } from "@ag-grid-community/core";

import { ShowHide } from "components";
import { IconButton } from "components/buttons";

interface ExpandCellProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> extends ICellRendererParams {
  onClick: (id: number) => void;
  rowCanExpand?: (row: R) => boolean;
}

const ExpandCell = <R extends Table.Row<G>, G extends Model.Group = Model.Group>({
  rowCanExpand,
  onClick,
  node,
  ...props
}: ExpandCellProps<R, G>): JSX.Element => {
  const row: R = node.data;

  const rowIsHovered = () => {
    const parent = props.eGridCell.parentElement;
    if (!isNil(parent)) {
      const cls = parent.getAttribute("class");
      return cls?.indexOf("ag-row-hover") !== -1;
    }
    return false;
  };

  if (row.meta.isPlaceholder === false) {
    if (isNil(rowCanExpand) || rowCanExpand(row) === true) {
      if (row.meta.children.length !== 0) {
        return (
          <IconButton
            className={"ag-grid-expand-button"}
            size={"small"}
            icon={<FontAwesomeIcon icon={faExpandAlt} />}
            onClick={() => onClick(node.data.id)}
          />
        );
      } else {
        return (
          <ShowHide show={rowIsHovered()}>
            <IconButton
              className={"ag-grid-expand-button"}
              size={"small"}
              icon={<FontAwesomeIcon icon={faExpandAlt} />}
              onClick={() => onClick(node.data.id)}
            />
          </ShowHide>
        );
      }
    } else {
      return (
        <ShowHide show={rowIsHovered()}>
          <IconButton
            className={"ag-grid-expand-button"}
            size={"small"}
            disabled={true}
            icon={<FontAwesomeIcon icon={faExpandAlt} />}
          />
        </ShowHide>
      );
    }
  } else {
    return <></>;
  }
};

export default ExpandCell;
