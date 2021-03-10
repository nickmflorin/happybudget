import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { ICellRendererParams } from "ag-grid-community";

interface SelectCellProps extends ICellRendererParams {
  onSelect: (id: number | string) => void;
  onDeselect: (id: number | string) => void;
}

const SelectCell = ({ onSelect, onDeselect, node }: SelectCellProps): JSX.Element => {
  return (
    <Checkbox
      checked={node.data.meta.selected}
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
