import React, { forwardRef, ForwardedRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { icons } from "lib/ui";
import * as ui from "lib/ui/types";

import { useIcon } from "./hooks";

function _IconComponent(
  // The default value for the `axis` here must be consistent with the default value in SASS.
  {
    icon,
    size,
    axis = ui.SizeAxes.VERTICAL,
    contain,
    color = icons.IconColors.GREY,
    ref,
    ...props
  }: icons.IconComponentProps & { readonly ref?: ForwardedRef<SVGSVGElement> },
) {
  const iconProps = useIcon({ ...props, axis, size, contain, color });
  return <FontAwesomeIcon {...props} {...iconProps} ref={ref} icon={icons.getNativeIcon(icon)} />;
}

const ForwardedIconComponent = forwardRef(
  (props: icons.IconComponentProps, ref: ForwardedRef<SVGSVGElement>) => (
    <_IconComponent {...props} ref={ref} />
  ),
) as typeof _IconComponent;

export const IconComponent = React.memo(ForwardedIconComponent);

/**
 * Renders a FontAwesome icon based on the provided `icon` prop.
 *
 * This component represents the primary definition for an icon in the application and the above
 * <IconComponent /> should not be used outside of this file.
 *
 * This <Icon /> component allows the `icon` prop to be provided as either an element,
 * {@link icons.IconElement}, or a name/prefix definition, {@link icons.BasicIconProp}
 * (e.g. ["far", "slack"]).  This allows components that accept an `icon` prop to accept it either
 * as an `<Icon />` rendered element, {@link icons.IconElement}, or a prefix/name combination,
 * {@link icons.BasicIconProp}, while still rendering the provided prop inside of an `<Icon />`
 * element it defines:
 *
 * type ButtonProps = { ..., icon: IconProp };
 * const Button = (props: ButtonProps) => {
 *   ...
 *   return (
 *     <div className="button">
 *       <Icon icon={props.icon} className={"button-icon"} />
 *       <div className="button-text">{props.children}</div>
 *     </div>
 *   )
 * }
 *
 * This is important because it allows an `icon` prop to be used and passed between components in a
 * way that does not introduce logical concerns if a component further up in the tree specifies
 * other attributes on the icon and the component on the bottom of the tree still needs to render
 * it.
 *
 * @example
 * const previousIcon = <Icon className={"icon--previous"} icon={"square"} />;
 * const finalIcon = <Icon icon={previousIcon} className={"icon--button"} />;
 *
 * ReactDOM.render(finalIcon, document.getElementById("#root"));
 * "<svg class="icon--previous icon--button">...</svg>"
 */
const _Icon = forwardRef(function Icon(
  { icon, ...props }: icons.IconProps,
  ref: ForwardedRef<SVGSVGElement>,
) {
  if (icons.isIconElement(icon)) {
    return icons.mergeIconElementWithProps(icon, props);
  }
  return <IconComponent {...props} ref={ref} icon={icon} />;
});

/* It is important that we define the displayName and name such that the `_Icon` component above can
   properly determine whether or not the provided prop is an actual <Icon /> element or the
   prefix/name traditional specification. */
export const Icon = Object.assign(React.memo(_Icon), { displayName: "Icon", name: "Icon" });
