import React from "react";

import { useSelector } from "react-redux";

import { store } from "application";

import { AppLoading } from "./AppLoading";

export const ConnectedAppLoading = (): JSX.Element => {
  const applicationLoading = useSelector(store.selectors.selectApplicationLoading);
  return <AppLoading visible={applicationLoading} />;
};
