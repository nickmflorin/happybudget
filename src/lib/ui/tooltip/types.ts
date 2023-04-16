import { ReactNode } from "react";

import { TooltipPropsWithTitle } from "antd/es/tooltip";

import { formatters, EnumeratedLiteralType, enumeratedLiterals } from "../../util";
import * as buttons from "../buttons";

export const TooltipTypes = enumeratedLiterals(["info", "brand", "entity"] as const);
export type TooltipType = EnumeratedLiteralType<typeof TooltipTypes>;

export type ItemizedTooltipItem = {
  readonly label: string;
  readonly value: string | number;
  readonly formatter?: formatters.Formatter<string | number>;
};

export type TooltipContent = string | JSX.Element | ItemizedTooltipItem[];

/* For Tooltips, the className and style will wind up being attributed to the children components.
   We need to use overlayClassName and overlayStyle. */
export type TooltipProps = Omit<
  Partial<TooltipPropsWithTitle>,
  "title" | "className" | "style" | "children"
> & {
  readonly content: TooltipContent;
  readonly includeLink?: buttons.IncludeLink;
  // Only applicable when content is specified as IItemizedTooltipItem[].
  readonly valueFormatter?: formatters.Formatter<string | number>;
};

export type DeterministicTooltip = string | Omit<TooltipProps, "children">;

export type Tooltip = DeterministicTooltip | ((args: { children: ReactNode }) => JSX.Element);
