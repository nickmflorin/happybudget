import React from "react";
import moment from "moment-timezone";
import { isNil } from "lodash";

import { Icon } from "components";
import { Select } from "components/fields";
import { SelectProps } from "components/fields/Select";

interface TimezoneSelectProps extends SelectProps<string> {}

const TimezoneSelect: React.FC<TimezoneSelectProps> = ({ placeholder = "Time Zone", ...props }) => {
  return (
    <Select
      placeholder={"Time Zone"}
      suffixIcon={<Icon icon={"clock"} weight={"solid"} />}
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

export default React.memo(TimezoneSelect);
