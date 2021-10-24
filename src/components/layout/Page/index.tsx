import React, { ReactNode } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { WrapInApplicationSpinner } from "components";

import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";

import "./index.scss";

interface PageProps extends StandardComponentProps {
  readonly className?: string;
  // Required for pages that do not have a full page table in them to get the
  // content area scrollable.
  readonly contentScrollable?: boolean;
  readonly children?: ReactNode;
  readonly loading?: boolean;
  readonly style?: React.CSSProperties;
  readonly title?: string;
  readonly subTitle?: JSX.Element;
  readonly footer?: JSX.Element;
  readonly extra?: JSX.Element[];
}

const Page = (props: PageProps): JSX.Element => (
  <div className={"page"} style={props.style}>
    {!isNil(props.title) && (
      <PageHeader title={props.title} extra={props.extra}>
        {props.subTitle}
      </PageHeader>
    )}
    <WrapInApplicationSpinner loading={props.loading}>
      {!isNil(props.children) && (
        <div className={classNames("page-content", props.className, { scrollable: props.contentScrollable })}>
          {props.children}
        </div>
      )}
    </WrapInApplicationSpinner>
    {!isNil(props.footer) && <PageFooter>{props.footer}</PageFooter>}
  </div>
);

Page.Footer = PageFooter;
Page.Header = PageHeader;
export default Page;
