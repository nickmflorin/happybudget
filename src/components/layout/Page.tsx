import React from "react";
import classNames from "classnames";
import { PageHeader } from "antd";
import { RenderOrSpinner, RenderWithSpinner, ShowHide } from "components/display";
import "./Page.scss";

interface PageProps {
  className?: string;
  children: any;
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
          <div className={classNames("page-content", className)}>{children}</div>
        </RenderOrSpinner>
      </ShowHide>
      <ShowHide show={!hideWhenLoading}>
        <RenderWithSpinner className={"page-spinner"} loading={loading}>
          <div className={classNames("page-content", className)}>{children}</div>
        </RenderWithSpinner>
      </ShowHide>
    </PageHeader>
  </div>
);
