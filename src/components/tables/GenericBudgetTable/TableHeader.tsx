import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlusSquare, faPercentage } from "@fortawesome/free-solid-svg-icons";

import { Form, Input, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { SearchOutlined } from "@ant-design/icons";

import { IconButton } from "components/control/buttons";
import { SavingChanges } from "components/display";

import "./TableHeader.scss";

interface TableHeaderProps {
  saving?: boolean;
  selected?: boolean;
  search: string;
  deleteDisabled?: boolean;
  setSearch: (value: string) => void;
  onDelete: () => void;
  onSelect: (checked: boolean) => void;
}

const TableHeader = ({
  search,
  selected = false,
  saving = false,
  deleteDisabled = false,
  setSearch,
  onDelete,
  onSelect
}: TableHeaderProps): JSX.Element => {
  return (
    <div className={"table-header"}>
      <Checkbox checked={selected} onChange={(e: CheckboxChangeEvent) => onSelect(e.target.checked)} />
      <IconButton
        className={"dark"}
        size={"large"}
        icon={<FontAwesomeIcon icon={faTrash} />}
        onClick={() => onDelete()}
        disabled={deleteDisabled}
      />
      <IconButton className={"dark"} size={"large"} disabled={true} icon={<FontAwesomeIcon icon={faPlusSquare} />} />
      <IconButton className={"dark"} size={"large"} disabled={true} icon={<FontAwesomeIcon icon={faPercentage} />} />
      <Form layout={"horizontal"} style={{ marginRight: 6 }}>
        <Form.Item name={"search"}>
          <Input
            placeholder={"Search Rows"}
            value={search}
            allowClear={true}
            prefix={<SearchOutlined />}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
          />
        </Form.Item>
      </Form>
      {!isNil(saving) && <SavingChanges saving={saving} />}
    </div>
  );
};

export default TableHeader;
