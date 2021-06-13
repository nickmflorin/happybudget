import { isNil } from "lodash";

import { Tooltip } from "antd";

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

  if (isNil(rowCanExpand) || rowCanExpand(row) === true) {
    if (row.meta.children.length !== 0) {
      return (
        <Tooltip title={"Expand"} placement={"bottom"} overlayClassName={"tooltip-lower"}>
          <IconButton
            className={"ag-grid-expand-button"}
            size={"small"}
            icon={<FontAwesomeIcon icon={faExpandAlt} />}
            onClick={() => onClick(node.data.id)}
          />
        </Tooltip>
      );
    } else {
      return (
        <ShowHide show={rowIsHovered()}>
          <Tooltip title={"Expand"} placement={"bottom"} overlayClassName={"tooltip-lower"}>
            <IconButton
              className={"ag-grid-expand-button"}
              size={"small"}
              icon={<FontAwesomeIcon icon={faExpandAlt} />}
              onClick={() => onClick(node.data.id)}
            />
          </Tooltip>
        </ShowHide>
      );
    }
  } else {
    return (
      <ShowHide show={rowIsHovered()}>
        <Tooltip title={"Fill in account to expand"} placement={"bottom"} overlayClassName={"tooltip-lower"}>
          <IconButton
            className={"ag-grid-expand-button fake-disabled"}
            size={"small"}
            disabled={false}
            icon={<FontAwesomeIcon icon={faExpandAlt} />}
          />
        </Tooltip>
      </ShowHide>
    );
  }
};

export default ExpandCell;
