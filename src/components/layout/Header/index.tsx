import { Link } from "react-router-dom";
import { Layout } from "antd";
import { HeaderLogo } from "components/display/svgs";
import "./index.scss";

const Header = (): JSX.Element => {
  return (
    <Layout.Header className={"header"}>
      <div className={"home-container"}>
        <Link to={"/"}>
          <HeaderLogo />
        </Link>
      </div>
    </Layout.Header>
  );
};

export default Header;
