import React from "react";
import { Switch } from "react-router-dom";
import classNames from "classnames";

import { Layout } from "components/layout";
import { LayoutProps } from "components/layout/Layout";

type GenericLayoutProps = {
  readonly children: JSX.Element;
} & Omit<LayoutProps, "collapsed">;

const GenericLayout: React.FC<GenericLayoutProps> = ({ children, ...props }) => {
  return (
    <Layout {...props} collapsed className={classNames("layout--budget", props.className)}>
      <Switch>{children}</Switch>
    </Layout>
  );
};

export default GenericLayout;
