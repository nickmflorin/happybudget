import { ComponentProps, ReactNode } from "react";

import { Page as ReactPDFPage } from "@react-pdf/renderer";
import classNames from "classnames";

import { mergeStylesFromClassName } from "deprecated/style/pdf";

export type BasePageProps = ComponentProps<typeof ReactPDFPage> & {
  readonly className?: string;
  children?: ReactNode;
};

const BasePage = ({ children, ...props }: BasePageProps): JSX.Element => (
  <ReactPDFPage
    size="A4"
    {...props}
    style={{ ...mergeStylesFromClassName(classNames("page", props.className)), ...props.style }}
  >
    {children}
  </ReactPDFPage>
);

export default BasePage;
