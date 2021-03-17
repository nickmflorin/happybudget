import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { isNil } from "lodash";
import { ShowHide, ApplicationSpinner } from "components/display";

const ApplicationRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  return (
    <React.Fragment>
      <Route {...props} />
    </React.Fragment>
  );
};

export default ApplicationRoute;
