import React from "react";
import moment from "moment-timezone";
import { isNil } from "lodash";

import { Icon } from "components";
import { Select } from "components/fields";
import { SelectProps } from "components/fields/Select";

// Copied directly from RC-Select
interface OptionCoreData {
  key?: string | number;
  disabled?: boolean;
  value: string | number;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: React.ReactNode;
  children?: React.ReactNode;
}

// Copied directly from RC-Select
interface OptionData extends OptionCoreData {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [prop: string]: any;
}

// Copied directly from RC-Select
export interface OptionGroupData {
  key?: string | number;
  label?: React.ReactNode;
  options: OptionData[];
  className?: string;
  style?: React.CSSProperties;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [prop: string]: any;
}

const TimezoneSelect: React.FC<SelectProps<string>> = ({ placeholder = "Time Zone", ...props }) => {
  return (
    <Select
      placeholder={placeholder}
      suffixIcon={<Icon icon={"clock"} weight={"solid"} />}
      showArrow
      showSearch
      filterOption={(input: string, option?: OptionData | OptionGroupData) =>
        !isNil(option) && !isNil(option.children)
          ? (option.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
          : false
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
