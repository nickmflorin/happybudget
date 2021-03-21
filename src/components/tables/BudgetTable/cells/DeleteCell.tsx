import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { ICellRendererParams } from "ag-grid-community";
import { IconButton } from "components/control/buttons";

interface DeleteCellProps extends ICellRendererParams {
  onClick: (data: Table.AccountRow | Table.SubAccountRow) => void;
}

const DeleteCell = ({ onClick, node }: DeleteCellProps): JSX.Element => {
  return (
    <IconButton
      className={"ag-grid-table-action-button"}
      size={"small"}
      icon={<FontAwesomeIcon icon={faTrashAlt} />}
      onClick={() => onClick(node.data)}
    />
  );
};

export default DeleteCell;
