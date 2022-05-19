import React from "react";
import { map } from "lodash";

import ItemizedTooltipItem from "./ItemizedTooltipItem";

type ItemizedTooltipContentProps = {
  readonly items: IItemizedTooltipItem[];
  readonly formatter?: Table.NativeFormatter<string | number>;
};

const ItemizedTooltipContent = (props: ItemizedTooltipContentProps): JSX.Element => (
  <div className={"itemized-tooltip-content"}>
    {map(props.items, (item: IItemizedTooltipItem, i: number) => (
      <ItemizedTooltipItem {...item} formatter={item.formatter || props.formatter} key={i} />
    ))}
  </div>
);

export default React.memo(ItemizedTooltipContent);
