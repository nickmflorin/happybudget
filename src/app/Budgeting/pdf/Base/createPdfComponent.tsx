import React, { ReactNode } from "react";
import { mergeStylesFromClassName } from "../Styles";

export interface PdfComponentProps extends StandardPdfComponentProps {
  readonly children?: ReactNode;
  readonly debug?: boolean;
  readonly fixed?: boolean;
  readonly render?: (params: {
    pageNumber: number;
    totalPages: number;
    subPageNumber: number;
    subPageTotalPages: number;
  }) => ReactNode;
}

export const createPdfComponent =
  <P extends PdfComponentProps = PdfComponentProps>(
    /* eslint-disable indent */
    Component: React.ComponentType<Omit<P, "className">>
  ): React.FC<P> =>
  ({ className, ...props }: P) =>
    (
      <Component
        {...(props as Omit<P, "className">)}
        debug={props.debug}
        style={{ ...mergeStylesFromClassName(className), ...props.style }}
      />
    );

export default createPdfComponent;
