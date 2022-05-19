import React from "react";

const ItemizedTooltipItem = (props: IItemizedTooltipItem): JSX.Element => (
  <div className={"itemized-tooltip-item"}>
    <div className={"label"}>{props.label}</div>
    <div className={"value"}>{props.value}</div>
  </div>
);

export default React.memo(ItemizedTooltipItem);
