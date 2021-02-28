import React from "react";

import { ShowHide } from "components/display";

interface FooterProps {
  copyright?: boolean;
  brand?: boolean;
}

const Footer = ({ copyright = true, brand = true }: FooterProps): JSX.Element => {
  return (
    <div className={"footer"}>
      <ShowHide show={brand}>
        <div className={"logo-container"}>
          <img alt={"Powered By Nirveda"} />
        </div>
      </ShowHide>
      <ShowHide show={copyright}>
        <div className={"copyright-container"}>
          <p className={"copyright-text"}>{"Footer"}</p>
        </div>
      </ShowHide>
    </div>
  );
};

export default Footer;
