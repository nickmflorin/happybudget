import React, { ReactNode } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { PageHeader } from "antd";
import { WrapInApplicationSpinner } from "components";
import "./Page.scss";

interface PageProps {
  className?: string;
  children?: ReactNode;
  loading?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

export const Page = ({ className, children, title, style = {}, loading = false }: PageProps): JSX.Element => (
  <div className={"page"} style={style}>
    <PageHeader title={title}>
      <WrapInApplicationSpinner loading={loading}>
        {!isNil(children) && <div className={classNames("page-content", className)}>{children}</div>}
      </WrapInApplicationSpinner>
    </PageHeader>
  </div>
);
