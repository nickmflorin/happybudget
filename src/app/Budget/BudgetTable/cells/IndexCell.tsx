import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

import { ICellRendererParams } from "ag-grid-community";
import { IconButton } from "components/control/buttons";

interface IndexCellProps extends ICellRendererParams {
  onSelect: (id: number | string) => void;
  onDeselect: (id: number | string) => void;
  onNew: () => void;
}

const IndexCell = <R extends Table.Row>({ onSelect, onDeselect, onNew, node }: IndexCellProps): JSX.Element => {
  // Since the SelectCell is the first cell in the table, group footers will
  // potentially span this cell across the columns - but we never want the group
  // footer row to be selectable.
  const row: R = node.data;
  if (row.meta.isGroupFooter === true) {
    return <></>;
  } else if (row.meta.isTableFooter) {
    return (
      <IconButton
        className={"green"}
        size={"medium"}
        icon={<FontAwesomeIcon icon={faPlusCircle} />}
        onClick={() => onNew()}
      />
    );
  }
  return (
    <Checkbox
      checked={node.group === false && node.data.meta.selected}
      onChange={(e: CheckboxChangeEvent) => {
        if (e.target.checked) {
          onSelect(node.data.id);
        } else {
          onDeselect(node.data.id);
        }
      }}
    />
  );
};

export default IndexCell;
