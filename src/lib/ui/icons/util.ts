import React from "react";

import classNames from "classnames";

import * as typeguards from "./typeguards";
import * as types from "./types";

/**
 * Returns the internal icon `code` for the provided icon, {@link types.Icon}, or icon type,
 * {@link types.IconType}.
 */
export const getIconCode = <
  T extends types.IconCode,
  N extends types.GetIconName<T>,
  P extends types.GetIconPrefix<T>,
>(
  i: types.Icon<T, N> | P | T,
): T => {
  if (typeguards.isIconPrefix(i)) {
    return types.IconCodeMap[i] as T;
  } else if (typeguards.isIconCode(i)) {
    return i;
  }
  // I do not understand why we have to coerce this.
  return getIconCode(i.type as T);
};

/**
 * Returns the Font Awesome `prefix` for the provided icon, {@link types.Icon}, or icon type,
 * {@link types.IconType}.
 */
export const getIconPrefix = <
  T extends types.IconCode,
  N extends types.GetIconName<T>,
  P extends types.GetIconPrefix<T>,
>(
  i: types.Icon<T, N> | P | T,
): P => {
  if (typeguards.isIconPrefix(i)) {
    return i;
  } else if (typeguards.isIconCode(i)) {
    return types.IconPrefixMap[i] as P;
  } else {
    // I do not understand why we have to coerce this.
    return getIconPrefix<T, N, P>(i.type as T);
  }
};

export const getIconLicense = <T extends types.IconCode, N extends types.GetIconName<T>>(
  i: types.Icon<T, N> | N,
): types.IconLicense => {
  // This will throw an error if an IconName is associated with multiple weights.
  const ic = typeof i === "string" ? getIcon<T, N>({ name: i }) : (i as types.Icon<T, N>);

  let found: types.IconLicense[] = [];

  const isIconName = (v: types.LicensedIcon<types.IconName> | types.IconName): v is N =>
    typeof v === "string" && v === ic.name;

  const isLicensedIcon = (
    v: types.LicensedIcon<types.IconName> | types.IconName,
  ): v is types.LicensedIcon<N> => typeof v !== "string" && v.name === ic.name;

  const arr: (types.LicensedIcon<types.IconName> | types.IconName)[] = types.Icons[
    ic.type
  ].slice() as (types.LicensedIcon<types.IconName> | types.IconName)[];
  for (let i = 0; i < arr.length; i++) {
    const iteree: types.LicensedIcon<types.IconName> | types.IconName = arr[i];
    if (isIconName(iteree)) {
      found = [...found, types.IconLicenses.BOTH];
    } else if (isLicensedIcon(iteree)) {
      found = [...found, iteree.license];
    }
  }
  if (found.length === 0) {
    throw new Error(
      "Error Finding Icon License: Could not find any references to an Icon with name " +
        `'${ic.name}', type '${ic.type}'.  The original provided icon was specified as ` +
        `'${JSON.stringify(i)}.'`,
    );
  } else if (found.length !== 1) {
    throw new Error(
      "Error Finding Icon License: Found multiple references to an Icon with name " +
        `'${ic.name}', type '${ic.type}'.  The original provided icon was specified as ` +
        `'${JSON.stringify(i)}.'`,
    );
  }
  return found[0];
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
      (types.Icons[k as types.GetIconCode<N>] as readonly types.IconName[]).includes(name)
        ? ([...curr, k] as types.GetIconCode<N>[])
        : curr,
    [] as types.GetIconCode<N>[],
  );

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
    const names: types.IconName[] = (
      types.Icons[k as types.IconCode].slice() as (
        | types.IconName
        | types.LicensedIcon<types.IconName>
      )[]
    ).reduce(
      (
        prev: types.IconName[],
        curr: types.IconName | types.LicensedIcon<types.IconName>,
      ): types.IconName[] => (typeof curr === "string" ? [...prev, curr] : [...prev, curr.name]),
      [] as types.IconName[],
    );
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
export const getIcon = <T extends types.IconCode, N extends types.GetIconName<T>>(
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
export const getNativeIcon = <
  I extends types.Icon<T, N>,
  T extends types.IconCode,
  N extends types.GetIconName<T>,
  P extends types.GetIconPrefix<T>,
>(
  name: N | I,
): [P, N] => {
  if (typeguards.isIconName(name)) {
    const availableCodes = getIconCodes(name);
    if (availableCodes.length === 0) {
      throw new Error(
        `There are no available codes for icon with name '${name}', this should not happen, and ` +
          "means that the registered icons were not properly validated before registering with " +
          "the library.",
      );
    } else if (availableCodes.includes(DEFAULT_ICON_CODE as typeof availableCodes[number])) {
      return [getIconPrefix<T, N, P>(DEFAULT_ICON_CODE as T), name];
    }
    return [getIconPrefix<T, N, P>(([...availableCodes] as T[])[0]), name];
  }
  return [getIconPrefix<T, N, P>(name.type), name.name as N];
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
