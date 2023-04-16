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
  return i.type;
};

/**
 * This is the default FontAwesome prefix that will be *favored* when a prefix is not supplied and
 * just the {@link ui.types.IconName} is provided.
 */
export const DEFAULT_ICON_PREFIX = types.IconPrefixes.FAS as types.IconPrefix;
export const DEFAULT_ICON_CODE = getIconCode(DEFAULT_ICON_PREFIX);

/**
 * Returns the Font Awesome `prefix` for the provided icon, {@link types.Icon}, or icon type,
 * {@link types.IconType}.
 */
export const getIconPrefix = (i: types.Icon | types.IconType): types.IconPrefix => {
  if (typeguards.isIconPrefix(i)) {
    return i;
  } else if (typeguards.isIconCode(i)) {
    return types.IconPrefixMap[i];
  } else {
    return types.IconPrefixMap[i.type];
  }
};

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
export const getIconCodes = (name: types.IconName): types.IconCode[] =>
  Object.keys(types.Icons).reduce(
    (curr: types.IconCode[], k: string) =>
      (types.Icons[k as types.IconCode] as readonly types.IconName[]).includes(name)
        ? [...curr, k as types.IconCode]
        : curr,
    [],
  );

/**
 * Returns the prefixes, {@link types.IconPrefix[]}, for icons that are registered in the global
 * library with the provided name, {@link types.IconName}.
 *
 * A given name, {@link types.IconName}, can be associated with multiple prefixes,
 *  {@link types.IconPrefix[]}, if the same icon is registered in the library from multiple Font
 * Awesome style packages.
 *
 * @param {types.IconName} name
 *   The name for which the registered prefixes should be returned.
 *
 * @returns {types.IconPrefix[]}
 */
export const getIconPrefixes = (name: types.IconName): types.IconPrefix[] =>
  getIconCodes(name).map((i: types.IconCode) => getIconPrefix(i));

/**
 * Returns a set icons, {@link types.Icon[]}, based on the provided lookup.  If the lookup is not
 * provided, all icons will be returned.
 *
 * @param {{ name?: N; type: T } | { name: N } } lookup
 *   Either an optional name, {@link types.IconName}, and type, {@link types.IconCode}, or just the
 *   name, {@link types.IconName}, that should be used to filter the set of returned icons.
 *
 * @returns {types.Icon[]}
 */
export function getIcons<T extends types.IconCode, N extends types.IconName>(
  lookup?: { name?: N; type: T } | { name: N },
): types.Icon[] {
  let icons = Object.keys(types.Icons).reduce((curr: types.Icon[], k: string): types.Icon[] => {
    const names: readonly types.IconName[] = types.Icons[k as types.IconCode];
    return [...curr, ...names.map((n: types.IconName) => ({ type: k, name: n } as types.Icon))];
  }, []);
  if (
    lookup === undefined ||
    ((lookup as { name?: N; type: T }).type === undefined && lookup.name === undefined)
  ) {
    return icons;
  } else if ((lookup as { name?: N; type: T }).type !== undefined) {
    icons = icons.filter((i: types.Icon) => i.type === (lookup as { name?: N; type: T }).type);
  }
  if (lookup.name !== undefined) {
    return icons.filter((i: types.Icon) => i.name === lookup.name);
  }
  return icons;
}

/**
 * Returns a specific icon, {@link types.Icon}, based on the provided lookup.  If the lookup
 * is associated with multiple icons, or the lookup is associated with no icon, an error will be
 * thrown.
 *
 * @param {{ name: N; type: T } | { name: N } } lookup
 *   Either the name, {@link types.IconName}, and type, {@link types.IconCode}, of the icon, or just
 *   the name, {@link types.IconName}, of the icon that should be returned.  If only the name is
 *   provided, the lookup will throw an {@link Error} if the icon, {@link types.Icon}, is associated
 *   with multiple types.
 *
 * @returns {types.Icon<T, N>}
 */
export const getIcon = <T extends types.IconCode, N extends types.IconName<T>>(
  lookup: { name: N; type: T } | { name: N },
): types.Icon<T, N> => {
  const icons = getIcons(lookup);
  if (icons.length === 0) {
    throw new Error(`An icon does not exist for the provided lookup: ${JSON.stringify(lookup)}.`);
  } else if (icons.length !== 1) {
    throw new Error(`Multiple icons exist for the provided lookup: ${JSON.stringify(lookup)}.`);
  }
  return icons[0] as types.Icon<T, N>;
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
    } else if (availableCodes.includes(DEFAULT_ICON_CODE)) {
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
