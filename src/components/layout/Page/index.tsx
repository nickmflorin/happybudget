import React, { ReactNode } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { WrapInApplicationSpinner } from "components";

import PageHeader from "./PageHeader";
import "./index.scss";

interface PageProps {
  readonly className?: string;
  // Required for pages that do not have a full page table in them to get the
  // content area scrollable.
  readonly contentScrollable?: boolean;
  readonly children?: ReactNode;
  readonly loading?: boolean;
  readonly style?: React.CSSProperties;
  readonly title?: string;
  readonly subTitle?: JSX.Element | JSX.Element[];
  readonly extra?: JSX.Element[];
}

const Page = ({
  className,
  children,
  title,
  subTitle,
  extra,
  contentScrollable,
  style = {},
  loading = false
}: PageProps): JSX.Element => (
  <div className={"page"} style={style}>
    <PageHeader title={title} subTitle={subTitle} extra={extra} />
    <WrapInApplicationSpinner loading={loading}>
      {!isNil(children) && (
        <div className={classNames("page-content", className, { scrollable: contentScrollable })}>{children}</div>
      )}
    </WrapInApplicationSpinner>
  </div>
);

export default Page;
