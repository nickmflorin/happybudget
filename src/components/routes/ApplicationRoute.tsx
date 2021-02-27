import React from "react";
import { Route } from "react-router-dom";
import { Header, Footer } from "components/layout";

import ApplicationConfig from "./ApplicationConfig";
import WrapInApplicationStore from "./WrapInApplicationStore";

const ApplicationRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  return (
    <WrapInApplicationStore>
      <ApplicationConfig>
        <Header />
        <div className={"app-content"}>
          <Route {...props} />
          <Footer copyright brand />
        </div>
      </ApplicationConfig>
    </WrapInApplicationStore>
  );
};

export default ApplicationRoute;
