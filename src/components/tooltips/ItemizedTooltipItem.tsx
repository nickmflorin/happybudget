import React from "react";
import { isNil } from "lodash";

const ItemizedTooltipItem = (props: IItemizedTooltipItem): JSX.Element => (
  <div className={"itemized-tooltip-item"}>
    <div className={"label"}>{props.label}</div>
    <div className={"value"}>{!isNil(props.formatter) ? props.formatter(props.value) : props.value}</div>
  </div>
);

export default React.memo(ItemizedTooltipItem);
