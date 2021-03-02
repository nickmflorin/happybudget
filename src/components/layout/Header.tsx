import { isNil } from "lodash";
import { Layout } from "antd";
import Toolbar, { IToolbarItem } from "./Toolbar";
import "./Header.scss";

interface HeaderProps {
  toolbar?: IToolbarItem[] | (() => JSX.Element);
}

const Header = ({ toolbar }: HeaderProps): JSX.Element => {
  return (
    <Layout.Header className={"header"}>
      <div className={"toolbar-wrapper"}>
        {!isNil(toolbar) && (Array.isArray(toolbar) ? <Toolbar items={toolbar as IToolbarItem[]} /> : toolbar())}
      </div>
    </Layout.Header>
  );
};

export default Header;
