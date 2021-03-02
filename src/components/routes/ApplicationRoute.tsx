import React from "react";
import { Route } from "react-router-dom";

import WrapInApplicationStore from "./WrapInApplicationStore";

const ApplicationRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  return (
    <WrapInApplicationStore>
      <Route {...props} />
    </WrapInApplicationStore>
  );
};

export default ApplicationRoute;
