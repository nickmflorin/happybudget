import React from "react";

import { mergeStylesFromClassName } from "deprecated/style/pdf";

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
  <P extends Omit<Pdf.StandardComponentProps | Pdf.StandardTextComponentProps, "className">>(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    Component: React.FunctionComponent<P> | React.ComponentClass<P, any>,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ): React.FunctionComponent<P & { readonly className?: string }> =>
  ({ className, ...props }: P & { readonly className?: string }): JSX.Element =>
    (
      <Component
        {...(props as P)}
        debug={props.debug}
        style={{ ...mergeStylesFromClassName(className), ...props.style }}
      />
    );

export default createPdfComponent;
