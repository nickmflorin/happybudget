import React from "react";

import classNames from "classnames";

import * as typeguards from "./typeguards";
import * as types from "./types";

/**
 * Returns the internal icon `code` for the provided icon, {@link types.Icon}, or icon type,
 * {@link types.IconType}.
 */
export const getIconCode = (i: types.Icon | types.IconType): types.IconCode => {
  if (typeguards.isIconPrefix(i)) {
    return types.IconCodeMap[i];
  } else if (typeguards.isIconCode(i)) {
    return i;
  }
  return getIconCode(i.type);
};

/**
 * Returns the Font Awesome `prefix` for the provided icon, {@link types.Icon}, or icon type,
 * {@link types.IconType}.
 */
export const getIconPrefix = (i: types.Icon | types.IconType): types.IconPrefix => {
  if (typeguards.isIconPrefix(i)) {
    return i;
  } else if (typeguards.isIconCode(i)) {
    return types.IconPrefixMap[i];
  }
  return getIconPrefix(i.type);
};

/**
 * This is the default FontAwesome prefix that will be *favored* when a prefix is not supplied and
 * just the {@link ui.types.IconName} is provided.
 */
export const DEFAULT_ICON_PREFIX = types.IconPrefixes.FAS as types.IconPrefix;
export const DEFAULT_ICON_CODE = getIconCode(DEFAULT_ICON_PREFIX);

export const getIconName = (v: types.Icon): types.IconName => v.name;

/**
 * Returns the codes, {@link types.IconCode[]}, for icons that are registered in the global library
 * with the provided name, {@link types.IconName}.
 *
 * A given name, {@link types.IconName}, can be associated with multiple codes
 *  {@link types.IconCode[]}, if the same icon is registered in the library from multiple Font
 * Awesome style packages.
 *
 * @param {types.IconName} name
 *   The name for which the registered codes should be returned.
 *
 * @returns {types.IconCode[]}
 */
export const getIconCodes = <N extends types.IconName = types.IconName>(
  name: N,
): types.GetIconCode<N>[] =>
  Object.keys(types.Icons).reduce(
    (curr: types.GetIconCode<N>[], k: string): types.GetIconCode<N>[] =>
      (types.Icons[k as keyof typeof types.Icons] as readonly types.IconName[]).includes(name)
        ? ([...curr, k] as types.GetIconCode<N>[])
        : curr,
    [] as types.GetIconCode<N>[],
  );

/**
 * Returns a set icons, {@link types.Icon[]}, based on the provided name, {@link types.IconName}.
 * If the name is not provided, all icons will be returned.
 *
 * @returns {types.Icon[]}
 */
export function getIcons(name?: types.IconName): types.Icon[] {
  const icons = Object.keys(types.Icons).reduce((curr: types.Icon[], k: string): types.Icon[] => {
    const names: types.IconName[] = (
      types.Icons[k as types.IconCode].slice() as types.IconName[]
    ).reduce(
      (prev: types.IconName[], curr: types.IconName): types.IconName[] => [...prev, curr],
      [] as types.IconName[],
    );
    return [...curr, ...names.map((n: types.IconName) => ({ type: k, name: n } as types.Icon))];
  }, []);
  if (name !== undefined) {
    return icons.filter((i: types.Icon) => i.name === name);
  }
  return icons;
}

/**
 * Returns a specific icon, {@link types.Icon}, based on the provided name, {@link types.IconName}.
 * If the name is associated with multiple icons, or the lookup is associated with no icon, an error
 * will be thrown.
 *
 * @returns {types.Icon<T, N>}
 */
export const getIcon = <N extends types.IconName>(name: N): types.IconForName<N> => {
  const icons = getIcons(name);
  if (icons.length === 0) {
    throw new Error(`An icon does not exist for the provided name '${name}'.`);
  } else if (icons.length !== 1) {
    throw new Error(`Multiple icons exist for the provided name '${name}'.`);
  }
  return icons[0] as types.IconForName<N>;
};

/**
 * Returns the native form of the icon, {@link types.Icon}, or name, {@link types.IconName}, that
 * should be provided to the Font Awesome SVG.
 *
 * The returned native form of the icon is typed differently than the {@link types.Icon} type
 * because the value that is returned cannot be typed such that both the prefix, {@link IconPrefix},
 * and the name, {@link IconName}, in the array are related to one another, which is what the
 * {@link types.Icon} type restricts.
 *
 * @param {types.IconName | types.Icon} name
 *   The icon name, {@link types.IconName}, or icon itself, {@link types.Icon}, that should be
 *   rendered by Font Awesome.  If only the {@link types.IconName} is provided, the prefix,
 *   {@link types.IconPrefix}, will be defaulted based on the icons registered with that name in
 *   the global library.
 *
 * @returns {[types.IconPrefix, types.IconName]}
 */
export const getNativeIcon = (
  name: types.IconName | types.Icon,
): [types.IconPrefix, types.IconName] => {
  if (typeguards.isIconName(name)) {
    const availableCodes = getIconCodes(name);
    if (availableCodes.length === 0) {
      throw new Error(
        `There are no available codes for icon with name '${name}', this should not happen, and ` +
          "means that the registered icons were not properly validated before registering with " +
          "the library.",
      );
    } else if (availableCodes.includes(DEFAULT_ICON_CODE as typeof availableCodes[number])) {
      return [getIconPrefix(DEFAULT_ICON_CODE), name];
    }
    return [getIconPrefix(availableCodes[0]), name];
  }
  return [getIconPrefix(name.type), name.name];
};

/**
 * Merges the provided props, {@link Omit<types.IconProps, "icon">}, into a previously created
 * icon element, {@link types.IconElement}, such that an icon element can be altered in place
 * by components who accept an `icon` as a prop, {@link types.IconProp}.
 */
export const mergeIconElementWithProps = (
  element: types.IconElement,
  { axis, size, style, className, ...props }: Omit<types.IconProps, "icon">,
): types.IconElement => {
  const mergedProps: Omit<types.IconProps, "icon"> = {
    ...props,
    axis: axis === undefined ? element.props.axis : axis,
    size: size === undefined ? element.props.size : size,
    style: { ...element.props.style, ...style },
    className: classNames(element.props.className, className),
  };
  /* We only have to force coerce the return type here because the `type` of the element is not
     defined generically with the cloneElement - but since we are cloning an element that we already
     ensured is of type types.IconElement, this coercion is safe. */
  return React.cloneElement<types.IconProps>(element, mergedProps) as types.IconElement;
};
