import React, { ReactNode } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { WrapInApplicationSpinner } from "components";

import PageHeader from "./PageHeader";
import "./index.scss";

interface PageProps {
  className?: string;
  children?: ReactNode;
  loading?: boolean;
  style?: React.CSSProperties;
  title?: string;
  extra?: JSX.Element[];
}

const Page = ({ className, children, title, extra, style = {}, loading = false }: PageProps): JSX.Element => (
  <div className={"page"} style={style}>
    <PageHeader title={title} extra={extra} />
    <WrapInApplicationSpinner loading={loading}>
      {!isNil(children) && <div className={classNames("page-content", className)}>{children}</div>}
    </WrapInApplicationSpinner>
  </div>
);

export default Page;
