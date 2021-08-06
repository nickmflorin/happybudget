import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

import { IconButton } from "components/buttons";

interface NewRowCellProps extends Table.CellProps<any, any, null> {
  onChangeEvent: (e: Table.ChangeEvent<any, any>) => void;
}

const NewRowCell = ({ onChangeEvent }: NewRowCellProps): JSX.Element => {
  return (
    <IconButton
      className={"green"}
      size={"medium"}
      icon={<FontAwesomeIcon icon={faPlusCircle} />}
      style={{ margin: "0 auto" }}
      onClick={() =>
        onChangeEvent({
          type: "rowAdd",
          payload: 1
        })
      }
    />
  );
};

export default NewRowCell;
