import { useState } from "react";
import { useSelector } from "react-redux";
import { ICellRendererParams, RowNode } from "ag-grid-community";
import { map, concat, isNil } from "lodash";

import { Select, Spin } from "antd";
import { SelectProps } from "antd/es/select";

import { useEffect } from "react";

interface IValueType {
  key?: number;
  label: React.ReactNode;
  value: string | number;
}

interface UnitCellProps extends ICellRendererParams {
  onChange: (object_id: number, parent_type: string, row: Table.IActualRow) => void;
  value: string | null;
  node: RowNode;
}

const BudgetItemCell = ({ value, node, onChange }: UnitCellProps): JSX.Element => {
  const [options, setOptions] = useState<IValueType[]>([]);
  const budgetItems = useSelector((state: Redux.IApplicationStore) => state.actuals.budgetItems);

  useEffect(() => {
    setOptions(
      concat(
        [
          {
            key: 0,
            label: "None",
            value: "None"
          }
        ],
        map(budgetItems.data, (item: IBudgetItem, index: number) => ({
          key: index + 1,
          label: item.identifier,
          value: `${item.id}-${item.type}`
        }))
      )
    );
  }, [budgetItems.data]);

  return (
    <Select<string>
      // labelInValue
      // filterOption={false}
      // onSearch={debounceFetcher}
      // notFoundContent={fetching ? <Spin size={"small"} /> : null}
      style={{ width: "100%" }}
      options={options}
      value={
        !isNil(node.data.object_id) && !isNil(node.data.parent_type)
          ? `${node.data.object_id}-${node.data.parent_type}`
          : "None"
      }
      placeholder={"Select Account"}
      // fetchOptions={fetchUserList}
      onChange={(id: string) => {
        if (id !== "None") {
          const parts = id.split("-");
          if (!isNaN(parseInt(parts[0]))) {
            onChange(parseInt(parts[0]), parts[1], node.data);
          } else {
            console.warn("");
          }
        }
      }}
    />
  );
};

export default BudgetItemCell;
