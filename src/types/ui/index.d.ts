declare type SearchIndex = string | string[];
declare type SearchIndicies = SearchIndex[];

declare type StandardComponentPropNames = "id" | "className" | "style";

declare interface StandardComponentProps {
  readonly id?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

declare interface StandardComponentWithChildrenProps extends StandardComponentProps {
  readonly children: import("react").ReactNode;
}

declare interface StandardPdfComponentProps {
  readonly className?: string;
  readonly style?: import("@react-pdf/renderer").Styles;
  readonly debug?: boolean;
  readonly children?: ReactNode;
  readonly debug?: boolean;
  readonly fixed?: boolean;
  readonly wrap?: boolean;
}

declare type IconProp =
  | import("@fortawesome/fontawesome-svg-core").IconName
  | [import("@fortawesome/fontawesome-svg-core").IconPrefix, import("@fortawesome/fontawesome-svg-core").IconName];
declare type IconWeight = "light" | "regular" | "solid";
declare type IconOrElement = IconProp | JSX.Element;

declare interface IIcon extends Omit<import("@fortawesome/react-fontawesome").FontAwesomeIconProps, "icon"> {
  readonly icon?: IconProp | undefined | null;
  readonly prefix?: import("@fortawesome/fontawesome-svg-core").IconPrefix;
  readonly green?: boolean;
  readonly weight?: IconWeight;
  readonly light?: boolean;
  readonly regular?: boolean;
  readonly solid?: boolean;
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
};
declare type ClickableIconCallback = (params: ClickableIconCallbackParams) => IconOrElement;
declare type ClickableIconOrElement = IconOrElement | ClickableIconCallback;

declare interface ClickableProps extends StandardComponentProps {
  readonly disabled?: boolean;
  readonly tooltip?: Tooltip;
  readonly icon?: ClickableIconOrElement;
}

declare type PasswordValidationID = "lowercase" | "uppercase" | "number" | "character" | "minChar";
declare type PasswordValidationName = { id: ValidationId; name: string };
declare type PasswordValidationState = { [key in ValidationId]: boolean };

declare type Pagination = {
  readonly page: number;
  readonly pageSize?: number;
};

declare type UseSizeProps<T extends string = string> = {
  size?: T;
} & { [key in T]?: boolean };
