import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpandAlt } from "@fortawesome/pro-solid-svg-icons";

import { ICellRendererParams } from "@ag-grid-community/core";
import { IconButton } from "components/buttons";

interface ExpandCellProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> extends ICellRendererParams {
  onClick: (id: number) => void;
  rowCanExpand?: (row: R) => boolean;
}

const ExpandCell = <R extends Table.Row<G>, G extends Model.Group = Model.Group>({
  rowCanExpand,
  onClick,
  node
}: ExpandCellProps<R, G>): JSX.Element => {
  const row: R = node.data;
  if (node.data.meta.isPlaceholder === false && (isNil(rowCanExpand) || rowCanExpand(row) === true)) {
    return (
      <IconButton
        className={"ag-grid-expand-button"}
        size={"small"}
        icon={<FontAwesomeIcon icon={faExpandAlt} />}
        onClick={() => onClick(node.data.id)}
      />
    );
  } else {
    return <></>;
  }
};

export default ExpandCell;
