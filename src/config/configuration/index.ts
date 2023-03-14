import React from "react";
import { History, Location } from "history";

import {
  configure as configureFontAwesome,
  configureAsync as configureFontAwesomeAsync,
} from "./fontAwesome";
import { configure as configureAgGrid } from "./aggrid";
import { configure as configureSentry } from "./sentry";

let prevPath: string | null = null;

const WHY_DID_YOU_RENDER_CONFIG: import("@welldone-software/why-did-you-render").WhyDidYouRenderOptions =
  {
    trackAllPureComponents: true,
    trackHooks: true,
    trackExtraHooks: [[require("react-redux/lib"), "useSelector"]],
  };

const _configureApplicationSync = (history: History) => {
  configureAgGrid();
  configureFontAwesome();
  configureSentry();

  const SEGMENT_ENABLED = process.env.NEXT_PUBLIC_SEGMENT_ENABLED;
  if (SEGMENT_ENABLED !== undefined && SEGMENT_ENABLED.toLowerCase() === "true") {
    // Listen and notify Segment of client-side page updates.
    history.listen((location: Location) => {
      if (location.pathname !== prevPath) {
        prevPath = location.pathname;
        window.analytics.page();
      }
    });
  }
};

export const configureApplication = (history: History) => {
  // WYDR is extremely useful in development, but slows down production bundles.
  const WHY_DID_YOU_RENDER = process.env.NEXT_PUBLIC_WHY_DID_YOU_RENDER;
  if (WHY_DID_YOU_RENDER !== undefined && WHY_DID_YOU_RENDER.toLowerCase() === "true") {
    const whyDidYouRender = require("@welldone-software/why-did-you-render");
    whyDidYouRender(React, WHY_DID_YOU_RENDER_CONFIG);
  }
  _configureApplicationSync(history);
  configureFontAwesome();
};

export const configureApplicationAsync = async (history: History) => {
  const WHY_DID_YOU_RENDER = process.env.NEXT_PUBLIC_WHY_DID_YOU_RENDER;
  if (WHY_DID_YOU_RENDER !== undefined && WHY_DID_YOU_RENDER.toLowerCase() === "true") {
    const module = await import("@welldone-software/why-did-you-render");
    module.default(React, WHY_DID_YOU_RENDER_CONFIG);
  }
  _configureApplicationSync(history);
  await configureFontAwesomeAsync();
};

export default configureApplication;
