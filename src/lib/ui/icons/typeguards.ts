import * as core from "../../core";

import * as types from "./types";

export const isIconPrefix = (i: unknown): i is types.IconPrefix => types.IconPrefixes.contains(i);

export const isIconCode = (i: unknown): i is types.IconCode =>
  typeof i === "string" && types.IconCodes.contains(i);

export const isIconCodeForName = <
  I extends types.Icon<T, N>,
  T extends types.IconCode,
  N extends types.GetIconName<T>,
>(
  code: I | T | N,
  name: N,
): code is T =>
  isIconCode(code) &&
  (types.Icons[code] as readonly string[]).includes(name as types.GetIconName<T>);

export const isIconName = (i: unknown): i is types.IconName => types.IconNames.contains(i);

export const isIcon = <T extends types.IconCode, N extends types.GetIconName<T>>(
  i: unknown,
): i is types.Icon<T, N> =>
  typeof i === "object" &&
  i !== null &&
  (i as types.Icon).name !== undefined &&
  isIconName((i as types.Icon).name) &&
  (i as types.Icon).type !== undefined &&
  isIconCode((i as types.Icon).type) &&
  isIconCodeForName((i as types.Icon).type, (i as types.Icon).name);

export const isIconBasicProp = (i: unknown): i is types.IconProp =>
  (typeof i === "string" && isIconName(i)) || isIcon(i);

/**
 * A typeguard that returns whether or not the provided icon prop, {@link types.IconProp}, is
 * a valid JSX.Element corresponding to the <Icon /> component, {@link types.IconElement}.
 *
 * It is very important that the <Icon /> component sets the `displayName` to "Icon" - otherwise,
 * we cannot safely check if a provided element is in fact a rendered Icon element,
 * {@link types.IconElement} or another element.
 */
export const isIconElement = (value: types.IconProp): value is types.IconElement =>
  core.isSpecificReactElement(value, { name: "Icon" });

export const isIconProp = (value: types.IconProp | JSX.Element): value is types.IconProp =>
  core.isJSXElement(value)
    ? isIconElement(value as types.IconProp)
    : isIconBasicProp(value as types.IconProp);
