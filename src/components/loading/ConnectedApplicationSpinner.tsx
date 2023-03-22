import React from "react";

import { useSelector } from "react-redux";

import { selectApplicationLoading } from "application/store/selectors";

import ApplicationSpinner from "./ApplicationSpinner";

const ConnectedApplicationSpinner = (): JSX.Element => {
  const applicationLoading = useSelector(selectApplicationLoading);
  return <ApplicationSpinner visible={applicationLoading} />;
};

export default React.memo(ConnectedApplicationSpinner);
