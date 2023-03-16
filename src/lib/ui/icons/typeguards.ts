import * as types from "./types";
import * as core from "../../core";

export const isIconPrefix = (i: unknown): i is types.IconPrefix => types.IconPrefixes.contains(i);

export const isIconCode = (i: unknown): i is types.IconCode => types.IconCodes.contains(i);

export const isIconCodeForName = <N extends types.IconName>(
  code: unknown,
  name: N,
): code is types.IconCode<N> =>
  isIconCode(code) && (types.Icons[code] as readonly types.IconName<typeof code>[]).includes(name);

export const isIconName = (i: unknown): i is types.IconName => types.IconNames.contains(i);

export const isIcon = (i: unknown): i is types.Icon =>
  typeof i === "object" &&
  i !== null &&
  isIconName((i as types.Icon).name) &&
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
