import React from "react";

import { isNil, map } from "lodash";
import moment from "moment-timezone";

import { SingleModelSyncSelect, SingleModelSyncSelectProps } from "./generic";

type Option = { readonly id: string; readonly label: string };

const toId = (v: string) => v.replace(" ", "").replace("_", "").toLowerCase();

const TimezoneSelect: React.FC<
  Omit<SingleModelSyncSelectProps<Option>, "getOptionLabel" | "options">
> = ({ placeholder = "Time Zone", ...props }) => (
  <SingleModelSyncSelect
    {...props}
    placeholder={placeholder}
    options={map(moment.tz.names(), (name: string) => ({
      id: toId(name),
      label: name,
    }))}
    value={isNil(props.value) ? null : toId(props.value)}
    getOptionLabel={(m: Option) => m.label}
  />
);

export default React.memo(TimezoneSelect);
