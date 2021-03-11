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
  value: number;
}

interface UnitCellProps extends ICellRendererParams {
  onChange: (id: number, row: Table.IActualRow) => void;
  value: number | null;
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
            value: -1
          }
        ],
        map(budgetItems.data, (item: IBudgetItem, index: number) => ({
          key: index + 1,
          label: item.identifier,
          value: item.id
        }))
      )
    );
  }, [budgetItems.data]);

  return (
    <Select<number>
      // labelInValue
      // filterOption={false}
      // onSearch={debounceFetcher}
      // notFoundContent={fetching ? <Spin size={"small"} /> : null}
      style={{ width: "100%" }}
      options={options}
      value={!isNil(value) ? value : -1}
      placeholder={"Select Account"}
      // fetchOptions={fetchUserList}
      onChange={(id: number) => {
        if (id !== -1) {
          onChange(id, node.data);
        }
      }}
    />
  );
};

export default BudgetItemCell;
