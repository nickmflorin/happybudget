export type TooltipType = "info" | "action";

export type IItemizedTooltipItem = {
  readonly label: string;
  readonly value: string | number;
  readonly formatter?: NativeFormatter<string | number>;
};

export type TooltipContent = string | JSX.Element | IItemizedTooltipItem[];

/* For Tooltips, the className and style will wind up being attributed to the children components.
   We need to use overlayClassName and overlayStyle. */
export type TooltipProps = Omit<
  Partial<import("antd/lib/tooltip").TooltipPropsWithTitle>,
  "title" | "className" | "style"
> & {
  readonly content: TooltipContent;
  readonly includeLink?: IncludeLink;
  readonly type?: TooltipType;
  // Only applicable when content is specified as IItemizedTooltipItem[].
  readonly valueFormatter?: NativeFormatter<string | number>;
};

export type DeterministicTooltip = string | Omit<TooltipProps, "children">;

export type Tooltip =
  | DeterministicTooltip
  | RenderPropChild<{ children: import("react").ReactNode }>;
