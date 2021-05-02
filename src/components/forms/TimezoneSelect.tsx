import moment from "moment-timezone";
import { isNil } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/pro-solid-svg-icons";
import { Select } from "antd";
import { SelectProps } from "antd/lib/select";

interface TimezoneSelectProps extends SelectProps<string> {}

const TimezoneSelect: React.FC<TimezoneSelectProps> = ({ placeholder = "Time Zone", ...props }) => {
  return (
    <Select
      placeholder={"Time Zone"}
      suffixIcon={<FontAwesomeIcon className={"icon"} icon={faClock} />}
      showArrow
      showSearch
      filterOption={(input: any, option: any) =>
        !isNil(option) ? option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
      }
      {...props}
    >
      {moment.tz.names().map((tz: string, index: number) => (
        <Select.Option key={index} value={tz}>
          {tz}
        </Select.Option>
      ))}
    </Select>
  );
};

export default TimezoneSelect;
