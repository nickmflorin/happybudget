import { ReactNode } from "react";
import { Page as ReactPDFPage } from "@react-pdf/renderer";
import { PageSize } from "@react-pdf/types";
import classNames from "classnames";

import { mergeStylesFromClassName } from "style/pdf";

export interface BasePageProps extends StandardPdfComponentProps {
  readonly size?: PageSize;
  readonly children: ReactNode;
}

const BasePage = ({ children, ...props }: BasePageProps): JSX.Element => {
  return (
    <ReactPDFPage
      size={"A4"}
      {...props}
      style={{ ...mergeStylesFromClassName(classNames("page", props.className)), ...props.style }}
    >
      {children}
    </ReactPDFPage>
  );
};

export default BasePage;
