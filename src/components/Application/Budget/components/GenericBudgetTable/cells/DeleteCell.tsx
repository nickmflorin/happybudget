import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { ICellRendererParams } from "ag-grid-community";
import { IconButton } from "components/control/buttons";

interface DeleteCellProps extends ICellRendererParams {
  onClick: (data: Redux.Budget.IAccountRow | Redux.Budget.ISubAccountRow) => void;
}

const DeleteCell = ({ onClick, node }: DeleteCellProps): JSX.Element => {
  return (
    <IconButton
      className={"dark"}
      size={"small"}
      icon={<FontAwesomeIcon icon={faTrash} />}
      onClick={() => onClick(node.data)}
    />
  );
};

export default DeleteCell;
