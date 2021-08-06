import React from "react";
import { Switch } from "react-router-dom";

import { Layout } from "components/layout";
import { LayoutProps } from "components/layout/Layout";

type GenericLayoutProps = {
  children: JSX.Element;
} & Pick<LayoutProps, "sidebar" | "toolbar">;

const GenericLayout: React.FC<GenericLayoutProps> = ({ children, ...props }) => {
  return (
    <Layout collapsed className={"layout--budget"} {...props}>
      <Switch>{children}</Switch>
    </Layout>
  );
};

export default GenericLayout;
