declare type SearchIndex = string | string[];
declare type SearchIndicies = SearchIndex[];

declare interface StandardComponentProps {
  readonly id?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

declare type StandardComponentPropNames = keyof StandardComponentProps;

declare interface StandardComponentWithChildrenProps extends StandardComponentProps {
  readonly children: import("react").ReactNode;
}

declare type PropsOf<T> = T extends React.ComponentType<infer Props> ? Props : never;

declare type RenderFunc = () => JSX.Element;

declare type TooltipType = "info" | "action";

/* For Tooltips, the className and style will wind up being attributed to the
   children components.  We need to use overlayClassName and overlayStyle. */
declare type TooltipProps = Omit<
  Partial<import("antd/lib/tooltip").TooltipPropsWithTitle>,
  "title" | "className" | "style"
> & {
  readonly title: string | JSX.Element;
  readonly includeLink?: IncludeLink;
  readonly type?: TooltipType;
};

declare type DeterministicTooltip = string | Omit<TooltipProps, "children">;

declare type Tooltip = DeterministicTooltip | RenderPropChild<{ children: import("react").ReactNode }>;

declare type LinkObj = {
  readonly text?: string;
  readonly to?: string;
  readonly onClick?: () => void;
};

declare type IncludeLinkParams = {
  readonly setLoading: (v: boolean) => void;
  readonly history: import("history").History<unknown>;
};

declare type IncludeLinkFn = (p: IncludeLinkParams) => LinkObj;
declare type IncludeLink = IncludeLinkFn | LinkObj;

declare type ClickableIconCallbackParams = {
  readonly isHovered: boolean;
  readonly iconProps?: Omit<IconProps, "icon">;
};

declare type ClickableIconCallback = (params: ClickableIconCallbackParams) => IconOrElement;
declare type ClickableIconOrElement = IconOrElement | ClickableIconCallback;

declare interface ClickableProps extends StandardComponentProps {
  readonly disabled?: boolean;
  readonly tooltip?: Tooltip;
  readonly icon?: ClickableIconOrElement;
}

declare type PasswordValidationID = "lowercase" | "uppercase" | "number" | "character" | "minChar";
declare type PasswordValidationName = { id: PasswordValidationID; name: string };
declare type PasswordValidationState = { [key in PasswordValidationID]: boolean };

declare type Pagination = {
  readonly page: number;
  readonly pageSize?: number;
};

declare type Dimension = { readonly width?: number; readonly height?: number };

declare type StandardSize = "xsmall" | "small" | "medium" | "standard" | "large" | "xlarge";

/**
 * The props that are used to dictate size in a flexible manner.  The generic
 * type T defines the different size options dictated as boolean values and the
 * generic type S defines the prop that can be supplied to dictate the size as
 * a string.
 *
 * Ex) UseSizeProps<"small" | "medium", "size">
 *     >>> { size: "small" } or { size: "medium" } or { medium: true } or ...
 */
declare type UseSizeProps<T extends string = StandardSize, S extends string = "size"> = {
  [key in S]?: T;
} & { [key in T]?: boolean };

declare type ModelSelectionMode = "single" | "multiple";
