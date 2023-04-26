import { Layout, LayoutProps } from "./Layout";

export type DashboardLayoutProps = Omit<LayoutProps, "header">;

export const DashboardLayout = (props: DashboardLayoutProps): JSX.Element => (
  <Layout header={<div>TEST</div>} className="layout--dashboard">
    {props.children}
  </Layout>
);
