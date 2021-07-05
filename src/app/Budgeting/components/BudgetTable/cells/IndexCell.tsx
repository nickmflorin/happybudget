import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

import { ICellRendererParams } from "@ag-grid-community/core";
import { IconButton } from "components/buttons";

interface IndexCellProps extends ICellRendererParams {
  onChangeEvent: (e: Table.ChangeEvent<any>) => void;
}

const IndexCell = <R extends Table.Row>({ onChangeEvent, node }: IndexCellProps): JSX.Element => {
  // Since the SelectCell is the first cell in the table, group footers will
  // potentially span this cell across the columns - but we never want the group
  // footer row to be selectable.
  const row: R = node.data;
  if (row.meta.isGroupFooter === true || row.meta.isBudgetFooter === true) {
    return <></>;
  } else if (row.meta.isTableFooter) {
    return (
      <IconButton
        className={"green"}
        size={"medium"}
        icon={<FontAwesomeIcon icon={faPlusCircle} />}
        onClick={() =>
          onChangeEvent({
            type: "rowAdd",
            payload: 1
          })
        }
      />
    );
  }
  return <></>;
};

export default IndexCell;
