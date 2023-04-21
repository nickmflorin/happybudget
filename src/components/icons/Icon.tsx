import React, { useMemo, forwardRef, ForwardedRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ui } from "lib";

import { useIcon } from "./hooks";

function _IconComponent(
  // The default value for the `axis` here must be consistent with the default value in SASS.
  {
    icon,
    size,
    axis = ui.SizeAxes.VERTICAL,
    contain,
    color = ui.IconColors.GREY,
    ref,
    ...props
  }: ui.IconComponentProps & { readonly ref?: ForwardedRef<SVGSVGElement> },
) {
  const iconProps = useIcon({ ...props, axis, size, contain, color });

  /*
  If the size is provided as a number or a valid CSS value, we cannot dynamically use SASS classes
  to define the size because there is no way to inform SASS what the provided value is.  However, if
  the size is provided as a standardized size string - we can just affix the element with the class
  name - so we do not need to mutate the style.
  */
  const style = useMemo(
    () =>
      size !== undefined && ui.isCSSSize(size)
        ? ui.sizeOnAxis(props.style, axis, size)
        : props.style,
    [props.style, axis, size],
  );

  return (
    <FontAwesomeIcon
      {...props}
      {...iconProps}
      style={style}
      ref={ref}
      icon={ui.getNativeIcon(icon)}
    />
  );
}

const ForwardedIconComponent = forwardRef(
  (props: ui.IconComponentProps, ref: ForwardedRef<SVGSVGElement>) => (
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
 * {@link ui.IconElement}, or a name/prefix definition, {@link ui.BasicIconProp}
 * (e.g. ["far", "slack"]).  This allows components that accept an `icon` prop to accept it either
 * as an `<Icon />` rendered element, {@link ui.IconElement}, or a prefix/name combination,
 * {@link ui.BasicIconProp}, while still rendering the provided prop inside of an `<Icon />`
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
  { icon, ...props }: ui.IconProps,
  ref: ForwardedRef<SVGSVGElement>,
) {
  if (ui.isIconElement(icon)) {
    return ui.mergeIconElementWithProps(icon, props);
  }
  return <IconComponent {...props} ref={ref} icon={icon} />;
});

/* It is important that we define the displayName and name such that the `_Icon` component above can
   properly determine whether or not the provided prop is an actual <Icon /> element or the
   prefix/name traditional specification. */
export const Icon = Object.assign(React.memo(_Icon), { displayName: "Icon", name: "Icon" });
