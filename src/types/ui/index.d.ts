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

declare type Tooltip =
  | (Omit<Partial<import("antd/lib/tooltip").TooltipPropsWithTitle>, "title"> & { readonly title: string })
  | string;

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
