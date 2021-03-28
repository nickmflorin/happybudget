import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsAltV } from "@fortawesome/free-solid-svg-icons";

import { ICellRendererParams } from "ag-grid-community";
import { IconButton } from "components/control/buttons";

interface ExpandCellProps extends ICellRendererParams {
  onClick: (id: number) => void;
}

const ExpandCell = ({ onClick, node }: ExpandCellProps): JSX.Element => {
  if (node.group === false && node.data.meta.isPlaceholder === false) {
    return (
      <IconButton
        className={"ag-grid-table-action-button"}
        size={"small"}
        icon={<FontAwesomeIcon icon={faArrowsAltV} />}
        onClick={() => onClick(node.data.id)}
      />
    );
  } else {
    return <></>;
  }
};

export default ExpandCell;
