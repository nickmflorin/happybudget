import React from "react";

import { useSelector } from "react-redux";

import { store } from "application";

import { AppLoading } from "./AppLoading";

export const ConnectedApplicationSpinner = (): JSX.Element => {
  const applicationLoading = useSelector(store.selectors.selectApplicationLoading);
  return <AppLoading visible={applicationLoading} />;
};
