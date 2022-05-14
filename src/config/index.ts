import React from "react";
import { History, Location } from "history";

import configureAgGrid from "./configureAgGrid";
import configureFontAwesome from "./configureFontAwesome";
import configureSentry from "./configureSentry";
import reportWebVitals from "./reportWebVitals";

import * as env from "./env";

export { default as componentLoader } from "./componentLoader";
export { default as lazyWithRetry } from "./lazyWithRetry";
export { default as registerIcons } from "./configureFontAwesome";

export * from "./constants";
export * as env from "./env";
export * as parsers from "./parsers";
export * as localization from "./localization";

let prevPath: string | null = null;

const configureApplication = (history: History) => {
  configureAgGrid();
  configureFontAwesome();

  /* If you want to start measuring performance in your app, pass a function
     to log results (for example: reportWebVitals(console.log))
     or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals */
  if (env.environmentIsNotProd() && env.REPORT_WEB_VITALS === true) {
    reportWebVitals(console.log);
  }

  if (env.environmentIsProd()) {
    configureSentry();

    // Listen and notify Segment of client-side page updates.
    history.listen((location: Location) => {
      if (location.pathname !== prevPath) {
        prevPath = location.pathname;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        window.analytics.page();
      }
    });
  }

  /* WYDR is extremely useful in development, but slows down production bundles.
     It is important that this is done outside of the scope of the configuration
		 method, because it must be done at the top of the src/index.tsx file before
		 any other imports are performed. */
  if (env.environmentIsLocal() && env.WHY_DID_YOU_RENDER) {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const whyDidYouRender = require("@welldone-software/why-did-you-render");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      trackHooks: true,
      trackExtraHooks: [[require("react-redux/lib"), "useSelector"]]
    });
  }
};

export default configureApplication;
