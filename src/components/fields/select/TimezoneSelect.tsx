import React from "react";
import moment from "moment-timezone";
import { isNil, map } from "lodash";

import SingleModelSelect, { SingleModelSelectProps } from "./SingleModelSelect";

type Option = { readonly id: string; readonly label: string };

const toId = (v: string) => v.replace(" ", "").replace("_", "").toLowerCase();

const TimezoneSelect: React.FC<Omit<SingleModelSelectProps<Option>, "getOptionLabel" | "options">> = ({
  placeholder = "Time Zone",
  ...props
}) => (
  <SingleModelSelect
    {...props}
    placeholder={placeholder}
    options={map(moment.tz.names(), (name: string) => ({
      id: toId(name),
      label: name
    }))}
    value={isNil(props.value) ? null : toId(props.value)}
    getOptionLabel={(m: Option) => m.label}
  />
);

export default React.memo(TimezoneSelect);
