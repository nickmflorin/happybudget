import { ReactNode } from "react";
import { isNil } from "lodash";
import { Layout } from "antd";
import { ShowHide } from "components/display";
import Toolbar, { IToolbarItem } from "./Toolbar";
import "./Header.scss";

interface HeaderProps {
  toolbar?: IToolbarItem[] | (() => JSX.Element);
  breadcrumbs?: ReactNode;
}

const Header = ({ breadcrumbs, toolbar }: HeaderProps): JSX.Element => {
  return (
    <Layout.Header className={"header"}>
      <div className={"breadcrumb-wrapper"}>
        <ShowHide show={!isNil(breadcrumbs)}>{breadcrumbs}</ShowHide>
      </div>
      <div className={"toolbar-wrapper"}>
        {!isNil(toolbar) && (Array.isArray(toolbar) ? <Toolbar items={toolbar as IToolbarItem[]} /> : toolbar())}
      </div>
    </Layout.Header>
  );
};

export default Header;
