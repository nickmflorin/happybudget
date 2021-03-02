import React, { ReactNode } from "react";
import { Link, useHistory } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { PageHeader } from "antd";
import { BreadcrumbProps } from "antd/lib/breadcrumb";
import { Route } from "antd/lib/breadcrumb/Breadcrumb";

import { RenderWithSpinner, Separator } from "components/display";

import "./Panel.scss";

interface PanelSectionProps {
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
  loading?: boolean;
  title: string;
  subTitle?: string;
  extra?: JSX.Element[];
  separatorTop?: boolean;
  separatorBottom?: boolean;
  headerProps?: { [key: string]: any };
  [key: string]: any;
}

export const PanelSection = ({
  className,
  style = {},
  children,
  title,
  subTitle,
  extra,
  separatorTop = false,
  separatorBottom = false,
  loading = false,
  headerProps = {}
}: PanelSectionProps): JSX.Element => {
  return (
    <div className={"panel-section"} style={style}>
      {separatorTop === true && <Separator />}
      <PageHeader title={title} subTitle={subTitle} extra={extra} {...headerProps}>
        <RenderWithSpinner loading={loading} position={"absolute"}>
          <div className={className}>{children}</div>
        </RenderWithSpinner>
      </PageHeader>
      {separatorBottom === true && <Separator />}
    </div>
  );
};

interface PanelProps {
  className?: string;
  children: ReactNode;
  loading?: boolean;
  title: string;
  subTitle?: string;
  includeBack?: boolean;
  onBack?: () => void;
  breadCrumb?: BreadcrumbProps;
  contentProps?: { [key: string]: any };
  subHeaderProps?: { [key: string]: any };
  extra?: JSX.Element[];
  tags?: JSX.Element | JSX.Element[];
  [key: string]: any;
}

/**
 * The main content component that appears within a Page component.
 *
 * The Panel can include a header, breadcrumbs and extra.  Additionally,
 * its content can be further broken down by PanelSection components.
 */
export const Panel = ({
  className,
  children,
  breadCrumb,
  title,
  subTitle,
  onBack,
  loading = false,
  includeBack = false,
  extra = [],
  tags = [],
  contentProps = {},
  subHeaderProps = {},
  ...props
}: PanelProps): JSX.Element => {
  const history = useHistory();
  return (
    <div className={classNames("panel", className)} {...props}>
      <PageHeader
        title={title}
        subTitle={subTitle}
        tags={tags}
        extra={extra}
        onBack={includeBack ? (!isNil(onBack) ? onBack : () => history.goBack()) : undefined}
        breadcrumb={{
          ...breadCrumb,
          itemRender: (route: Route, params: any, routes: Route[], paths: string[]): JSX.Element => {
            const last = routes.indexOf(route) === routes.length - 1;
            return last ? (
              <span>{route.breadcrumbName}</span>
            ) : (
              <Link to={"/" + paths.join("/")}>{route.breadcrumbName}</Link>
            );
          }
        }}
      >
        <RenderWithSpinner loading={loading} position={"absolute"}>
          {children}
        </RenderWithSpinner>
      </PageHeader>
    </div>
  );
};

Panel.Section = PanelSection;
