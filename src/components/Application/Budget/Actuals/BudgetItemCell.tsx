import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ICellRendererParams, RowNode } from "ag-grid-community";
import { map, concat, isNil } from "lodash";

import { Select } from "antd";

interface IValueType {
  key?: number;
  label: React.ReactNode;
  value: string | number;
}

interface UnitCellProps extends ICellRendererParams {
  onChange: (object_id: number, parent_type: string, row: Table.IActualRow) => void;
  node: RowNode;
}

const BudgetItemCell = ({ node, onChange }: UnitCellProps): JSX.Element => {
  const [options, setOptions] = useState<IValueType[]>([]);
  const budgetItems = useSelector((state: Redux.IApplicationStore) => state.actuals.budgetItems);

  useEffect(() => {
    const newOptions = map(budgetItems.data, (item: IBudgetItem, index: number) => ({
      key: index + 1,
      label: item.identifier,
      value: `${item.id}-${item.type}`
    }));
    if (isNil(node.data.object_id) || isNil(node.data.parent_type)) {
      setOptions(
        concat(
          [
            {
              key: 0,
              label: "None",
              value: "None"
            }
          ],
          newOptions
        )
      );
    } else {
      setOptions(newOptions);
    }
  }, [budgetItems.data, node.data]);

  return (
    <Select<string>
      style={{ width: "100%" }}
      options={options}
      showSearch
      optionFilterProp={"label"}
      filterOption={(input: string, option: any) => {
        if (!isNil(option.label) && !isNil(input)) {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }
        return false;
      }}
      value={
        !isNil(node.data.object_id) && !isNil(node.data.parent_type)
          ? `${node.data.object_id}-${node.data.parent_type}`
          : "None"
      }
      placeholder={"Select Account"}
      onChange={(id: string) => {
        if (id !== "None") {
          const parts = id.split("-");
          if (!isNaN(parseInt(parts[0]))) {
            onChange(parseInt(parts[0]), parts[1], node.data);
          }
        }
      }}
    />
  );
};

export default BudgetItemCell;
