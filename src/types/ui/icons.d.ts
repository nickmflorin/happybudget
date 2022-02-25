declare type IconName = import("@fortawesome/fontawesome-svg-core").IconName;
declare type IconPrefix = import("@fortawesome/fontawesome-svg-core").IconPrefix;

declare type IconProp = IconName | [IconPrefix, IconName];

declare type IconWeight = "light" | "regular" | "solid";

declare type IconOrElement = IconProp | JSX.Element;

declare type IconProps = Omit<import("@fortawesome/react-fontawesome").FontAwesomeIconProps, "icon"> & {
  readonly icon?: IconProp | undefined | null;
  readonly dimension?: Dimension;
  readonly prefix?: import("@fortawesome/fontawesome-svg-core").IconPrefix;
  readonly green?: boolean;
  readonly weight?: IconWeight;
  readonly light?: boolean;
  readonly regular?: boolean;
  readonly solid?: boolean;
};
