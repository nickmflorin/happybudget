import React from "react";
import { mergeStylesFromClassName } from "style/pdf";

/**
 * Higher Order Component (HOC) for wrapping a @react-pdf PDF Component with
 * our custom implementations.
 *
 * This includes (currently) one implementation:
 *
 * 1.  Intelligently allowing for className designations on components, and then
 *     recreating a component style from the global PDF Styles object (style/pdf)
 *     based on the present classNames.
 */
export const createPdfComponent =
  <P extends StandardPdfComponentProps = StandardPdfComponentProps>(
    Component: React.ComponentType<Omit<P, "className">>
  ): React.FC<P> =>
  ({ className, ...props }: P): JSX.Element =>
    (
      <Component
        {...(props as Omit<P, "className">)}
        debug={props.debug}
        style={{ ...mergeStylesFromClassName(className), ...props.style }}
      />
    );

export default createPdfComponent;
