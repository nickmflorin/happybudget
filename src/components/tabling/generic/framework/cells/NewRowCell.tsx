import { util } from "lib";

import { Icon } from "components";
import { IconButton } from "components/buttons";

interface NewRowCellProps extends Table.CellProps<any, any, any, any, null> {
  onChangeEvent: (e: Table.ChangeEvent<any>) => void;
}

const NewRowCell = ({ onChangeEvent }: NewRowCellProps): JSX.Element => {
  return (
    <IconButton
      className={"green"}
      size={"medium"}
      icon={<Icon icon={"plus-circle"} weight={"solid"} />}
      style={{ margin: "0 auto" }}
      onClick={() =>
        onChangeEvent({
          type: "rowAdd",
          payload: [{ id: `placeholder-${util.generateRandomNumericId()}`, data: {} }]
        })
      }
    />
  );
};

export default NewRowCell;
