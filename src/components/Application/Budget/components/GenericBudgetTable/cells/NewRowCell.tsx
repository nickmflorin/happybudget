import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

import { ICellRendererParams } from "ag-grid-community";
import { IconButton } from "components/control/buttons";

interface NewRowCellProps extends ICellRendererParams {
  onNew: () => void;
}

const NewRowCell = ({ onNew, node }: NewRowCellProps): JSX.Element => {
  return (
    <IconButton
      className={"green"}
      size={"medium"}
      icon={<FontAwesomeIcon icon={faPlusCircle} />}
      onClick={() => onNew()}
    />
  );
};

export default NewRowCell;
