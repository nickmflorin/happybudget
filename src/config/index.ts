import React from "react";
import { reduce } from "lodash";
import { History, Location } from "history";

import configureAgGrid from "./configureAgGrid";
import configureFontAwesome from "./configureFontAwesome";
import configureSentry from "./configureSentry";
import reportWebVitals from "./reportWebVitals";

import * as flags from "./flags";

export { default as componentLoader } from "./componentLoader";
export { default as lazyWithRetry } from "./lazyWithRetry";
export { default as registerIcons } from "./configureFontAwesome";

export * as flags from "./flags";
export * as localization from "./localization";

export const ConfigOptions: Application.ConfigOption[] = [
  { name: "tableDebug", default: false, devOnly: true },
  { name: "reportWebVitals", default: false },
  { name: "whyDidYouRender", default: false, devOnly: true }
];

export const Config: Application.Config = reduce(
  ConfigOptions,
  (curr: Application.Config, option: Application.ConfigOption) => ({
    ...curr,
    [option.name]: flags.evaluateFlagFromEnvOrMemory(option)
  }),
  {} as Application.Config
);

let prevPath: string | null = null;

const configureApplication = (history: History, initializeApp: () => void) => {
  configureAgGrid();
  configureFontAwesome();

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  if (process.env.NODE_ENV === "development" && Config.reportWebVitals === true) {
    /* eslint-disable no-console */
    reportWebVitals(console.log);
  }

  if (process.env.NODE_ENV === "production") {
    configureSentry();

    // Listen and notify Segment of client-side page updates.
    history.listen((location: Location) => {
      if (location.pathname !== prevPath) {
        prevPath = location.pathname;
        window.analytics.page();
      }
    });
  }

  // WYDR is extremely useful in development, but slows down production bundles.
  // It is important that this is done outside of the scope of the configuration method,
  // because it must be done at the top of the src/index.tsx file before any other imports are
  // performed.
  if (process.env.NODE_ENV === "development" && Config.whyDidYouRender) {
    console.log("Registering WYDR");
    const whyDidYouRender = require("@welldone-software/why-did-you-render");
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      trackHooks: true,
      trackExtraHooks: [[require("react-redux/lib"), "useSelector"]]
    });
  }

  initializeApp();
};

export default configureApplication;
