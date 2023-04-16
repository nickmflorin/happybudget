import { ui, formatters } from "lib";

import { ItemizedTooltipItem } from "./ItemizedTooltipItem";

type ItemizedTooltipContentProps = {
  readonly items: ui.ItemizedTooltipItem[];
  readonly formatter?: formatters.Formatter<string | number>;
};

export const ItemizedTooltipContent = (props: ItemizedTooltipContentProps): JSX.Element => (
  <div className="itemized-tooltip-content">
    {props.items.map((item: ui.ItemizedTooltipItem, i: number) => (
      <ItemizedTooltipItem {...item} formatter={item.formatter || props.formatter} key={i} />
    ))}
  </div>
);
