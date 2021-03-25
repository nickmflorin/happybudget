import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { ICellRendererParams } from "ag-grid-community";
import { IconButton } from "components/control/buttons";

interface DeleteCellProps<R extends Table.Row> extends ICellRendererParams {
  onClick: (data: R) => void;
}

const DeleteCell = <R extends Table.Row>({ onClick, node }: DeleteCellProps<R>): JSX.Element => {
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
