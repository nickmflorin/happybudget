import { ComponentProps } from "..";
import * as icons from "../icons";
import * as tooltip from "../tooltip";

export type LinkObj = {
  readonly text?: string;
  readonly to?: string;
  readonly onClick?: () => void;
};

export type IncludeLinkParams = {
  readonly setLoading: (v: boolean) => void;
  readonly history: import("history").History<unknown>;
};

export type IncludeLinkFn = (p: IncludeLinkParams) => LinkObj;
export type IncludeLink = IncludeLinkFn | LinkObj;

export type ClickableIconCallbackParams = {
  readonly isHovered: boolean;
  readonly iconProps?: Omit<icons.IconComponentProps, "icon">;
};

export type ClickableIconCallback = (params: ClickableIconCallbackParams) => icons.IconProp;
export type ClickableIconOrElement = icons.IconProp | ClickableIconCallback;

export type ClickableProps = ComponentProps<{
  readonly disabled?: boolean;
  readonly tooltip?: tooltip.Tooltip;
  readonly icon?: ClickableIconOrElement;
}>
