import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { ICellRendererParams } from "ag-grid-community";

interface SelectCellProps extends ICellRendererParams {
  onSelect: (id: number | string) => void;
  onDeselect: (id: number | string) => void;
}

const SelectCell = ({ onSelect, onDeselect, node }: SelectCellProps): JSX.Element => {
  // Since the SelectCell is the first cell in the table, group footers will
  // potentially span this cell across the columns - but we never want the group
  // footer row to be selectable.
  if (node.data.meta.isGroupFooter === true) {
    return <></>;
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

export default SelectCell;
