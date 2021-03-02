import React, { ReactNode } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { PageHeader } from "antd";
import { RenderOrSpinner, RenderWithSpinner, ShowHide } from "components/display";
import "./Page.scss";

interface PageProps {
  className?: string;
  children?: ReactNode;
  loading?: boolean;
  style?: React.CSSProperties;
  title?: string;
  hideWhenLoading?: boolean;
}

export const Page = ({
  className,
  children,
  title,
  style = {},
  loading = false,
  hideWhenLoading = false
}: PageProps): JSX.Element => (
  <div className={"page"} style={style}>
    <PageHeader title={title}>
      <ShowHide show={hideWhenLoading}>
        <RenderOrSpinner className={"page-spinner"} loading={loading}>
          {!isNil(children) && <div className={classNames("page-content", className)}>{children}</div>}
        </RenderOrSpinner>
      </ShowHide>
      <ShowHide show={!hideWhenLoading}>
        <RenderWithSpinner className={"page-spinner"} loading={loading}>
          {!isNil(children) && <div className={classNames("page-content", className)}>{children}</div>}
        </RenderWithSpinner>
      </ShowHide>
    </PageHeader>
  </div>
);
