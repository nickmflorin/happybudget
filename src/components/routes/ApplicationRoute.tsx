import React from "react";
import { Route } from "react-router-dom";
import { Header, Footer } from "components/layout";

import WrapInApplicationStore from "./WrapInApplicationStore";

const ApplicationRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  return (
    <WrapInApplicationStore>
      <Header />
      <div className={"app-content"}>
        <Route {...props} />
        <Footer />
      </div>
    </WrapInApplicationStore>
  );
};

export default ApplicationRoute;
