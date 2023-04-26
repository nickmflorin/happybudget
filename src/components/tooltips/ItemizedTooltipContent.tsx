import * as tooltip from "lib/ui/tooltip/types";
import * as formatters from "lib/util/formatters";

import { ItemizedTooltipItem } from "./ItemizedTooltipItem";

type ItemizedTooltipContentProps = {
  readonly items: tooltip.ItemizedTooltipItem[];
  readonly formatter?: formatters.Formatter<string | number>;
};

export const ItemizedTooltipContent = (props: ItemizedTooltipContentProps): JSX.Element => (
  <div className="itemized-tooltip-content">
    {props.items.map((item: tooltip.ItemizedTooltipItem, i: number) => (
      <ItemizedTooltipItem {...item} formatter={item.formatter || props.formatter} key={i} />
    ))}
  </div>
);
