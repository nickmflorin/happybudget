import React from "react";
import classNames from "classnames";
import { RenderOrSpinner, RenderWithSpinner, ShowHide } from "components/display";
import "./Page.scss";

interface PageProps {
  className?: string;
  children: any;
  loading?: boolean;
  extra?: JSX.Element[];
  style?: { [key: string]: any };
  header?: JSX.Element | string;
  hideWhenLoading?: boolean;
}

export const Page = ({
  className,
  children,
  header,
  style = {},
  extra,
  loading = false,
  hideWhenLoading = false
}: PageProps): JSX.Element => (
  <div className={classNames("page", className)} style={style}>
    <ShowHide show={hideWhenLoading}>
      <RenderOrSpinner className={"page-spinner"} loading={loading}>
        {children}
      </RenderOrSpinner>
    </ShowHide>
    <ShowHide show={!hideWhenLoading}>
      <RenderWithSpinner className={"page-spinner"} loading={loading}>
        {children}
      </RenderWithSpinner>
    </ShowHide>
  </div>
);
