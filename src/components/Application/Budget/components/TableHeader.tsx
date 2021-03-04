import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlusSquare, faPercentage } from "@fortawesome/free-solid-svg-icons";

import { Form, Input, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { IconButton } from "components/control/buttons";

import "./TableHeader.scss";

interface TableHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  onDelete: () => void;
  onSum: () => void;
  onPercentage: () => void;
}

const TableHeader = ({ search, setSearch, onDelete, onSum, onPercentage }: TableHeaderProps): JSX.Element => {
  return (
    <div className={"table-header"}>
      <Checkbox checked={false} />
      <IconButton
        className={"dark"}
        size={"large"}
        icon={<FontAwesomeIcon icon={faTrash} />}
        onClick={() => onDelete()}
      />
      <IconButton
        className={"dark"}
        size={"large"}
        // TODO: Change to the Sigma Icon once we have pro.
        icon={<FontAwesomeIcon icon={faPlusSquare} />}
        onClick={() => onSum()}
      />
      <IconButton
        className={"dark"}
        size={"large"}
        icon={<FontAwesomeIcon icon={faPercentage} />}
        onClick={() => onPercentage()}
      />
      <Form layout={"horizontal"}>
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
    </div>
  );
};

export default TableHeader;
