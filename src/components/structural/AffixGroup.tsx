import React, { Fragment, cloneElement } from "react";

import classNames from "classnames";
import { isFragment } from "react-is";

import { ui, core, OneOrMany } from "lib";
import * as icons from "lib/ui/icons";
import { Icon } from "components/icons";

// Iterates over the child elements, removing fragments (<></>) recursively.
const _getAffixes = (props: Pick<AffixGroupProps, "children" | "affixes">): ui.Affix[] => {
  if (props.children !== undefined) {
    const child = props.children;
    if (Array.isArray(child)) {
      /* If there are multiple children, we have to concatenate the results of recursive calls such
         that each child element will have Fragment(s) flattened out. */
      return child.reduce(
        (prev: ui.Affix[], curr: JSX.Element | icons.IconName) => [
          ...prev,
          ..._getAffixes({ children: curr }),
        ],
        [],
      );
    } else if (isFragment(child)) {
      return _getAffixes({ children: child.props.children });
    } else {
      return [child];
    }
  }
  const affixes = props.affixes || [];
  if (Array.isArray(affixes)) {
    // If there is a JSX.Element in the affixes, the fragments must be recursively removed.
    return affixes.reduce(
      (prev: ui.Affix[], curr: ui.Affix) =>
        core.isJSXElement(curr) ? [...prev, ..._getAffixes({ children: curr })] : [...prev, curr],
      [],
    );
  }
  return [affixes];
};

const AffixIcon = (props: {
  icon: icons.IconName | icons.IconElement | icons.Icon;
  spacing?: number;
  index?: number;
}) => (
  <Icon
    className="icon--affix"
    icon={props.icon}
    style={props.spacing !== undefined && props.index !== 0 ? { marginLeft: props.spacing } : {}}
  />
);

type AffixProps = {
  /*
  The icons.IconBasicProp cannot be a child because it includes icons.Icon which is an object of form
  { type: ..., name: ... }, and objects are not valid React children.  However, the icons.Icon type can
  still be provided as an element in the `affixes` prop - and in that case it will be converted to
  an `Icon` without using the `Affix` component here.
  */
  readonly children: JSX.Element | icons.IconName | icons.IconElement;
  readonly spacing?: number;
  readonly index?: number;
};

/* A utility component responsible for rendering an <Icon /> in the case that the child is a string
   IconName and otherwise rendering a child JSX.Element with the proper spacing and margin-left.
   This component is not meant to be exposed externally and its purpose is solely for the AffixGroup
   component below. */
const Affix = (props: AffixProps): JSX.Element => {
  if (ui.isIconName(props.children)) {
    return <AffixIcon {...props} icon={props.children} />;
  } else if (props.spacing !== undefined && props.index !== 0) {
    return cloneElement(props.children, {
      style: ui.safelyMergeIntoProvidedStyle(props.children.props.style, {
        marginLeft: props.spacing,
      }),
    });
  }
  return props.children;
};

export type AffixGroupProps = ui.ComponentProps<{
  readonly affixes?: ui.Affixes;
  readonly children?: OneOrMany<JSX.Element | icons.IconName>;
  /**
   * Defines the separation between the individual "affixes" in the `AffixGroup`.
   *
   * Default in SASS: 6px
   */
  readonly spacing?: number;
  /**
   * Defines whether or not the sizes of the individual "affixes" in the `AffixGroup` should resize
   * to take up 100% of the `AffixGroup`'s height (which in turn automatically takes up 100% of the
   * parent container's height).
   *
   * Default: false
   */
  readonly fillHeight?: boolean;
}>;

/**
 * A component that is intended to contain and horizontally distribute several smaller components
 * ("Affixes"), typically next to or on the same horizontal axis as a primary element, regardless of
 * the vertical sizing of the primary element and/or parent container that holds the primary element
 * and the `AffixGroup`. The components that it holds will typically be `Icon` components, `Button`
 * components and `Link` components.
 */
export const AffixGroup = ({
  children,
  spacing,
  affixes,
  fillHeight,
  ...props
}: AffixGroupProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "affix-group",
      { "affix-group--fill-height": fillHeight },
      props.className,
    )}
  >
    {_getAffixes({ children, affixes }).map((a: ui.Affix, i: number) =>
      core.isSpecificReactElement<AffixProps>(a, { name: "Affix" }) ? (
        <Fragment key={i}>{React.cloneElement(a, { index: i, spacing })}</Fragment>
      ) : ui.isIcon(a) ? (
        <AffixIcon key={i} icon={a} index={i} spacing={spacing} />
      ) : (
        <Affix key={i} spacing={spacing} index={i}>
          {a}
        </Affix>
      ),
    )}
  </div>
);
