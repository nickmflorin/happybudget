import React from "react";

import { History, Location } from "history";

import { configure as configureAgGrid } from "./aggrid";
import {
  configure as configureFontAwesome,
  configureAsync as configureFontAwesomeAsync,
} from "./fontAwesome";
import { configure as configureSentry } from "./sentry";

let prevPath: string | null = null;

type WhyDidYouRenderOptions =
  import("@welldone-software/why-did-you-render").WhyDidYouRenderOptions;

const WHY_DID_YOU_RENDER_CONFIG: WhyDidYouRenderOptions = {
  trackAllPureComponents: true,
  trackHooks: true,
  trackExtraHooks: [[require("react-redux/lib"), "useSelector"]],
};

const _configureApplicationSync = (history: History) => {
  configureAgGrid();
  configureFontAwesome();

  // TODO: Should this be restricted to the server?
  configureSentry();

  // Client specific configuration.
  if (typeof window !== "undefined") {
    const SEGMENT_ENABLED = process.env.NEXT_PUBLIC_SEGMENT_ENABLED;
    if (SEGMENT_ENABLED !== undefined && SEGMENT_ENABLED.toLowerCase() === "true") {
      // Listen and notify Segment of client-side page updates.
      history.listen((location: Location) => {
        if (location.pathname !== prevPath) {
          prevPath = location.pathname;
          if (window.analytics !== undefined) {
            window.analytics.page();
          } else {
            throw new TypeError("Segment is not properly configured on the global window object.");
          }
        }
      });
    }
    // WYDR is extremely useful in development, but slows down production bundles.
    const WHY_DID_YOU_RENDER = process.env.NEXT_PUBLIC_WHY_DID_YOU_RENDER;
    if (WHY_DID_YOU_RENDER !== undefined && WHY_DID_YOU_RENDER.toLowerCase() === "true") {
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
      const whyDidYouRender = require("@welldone-software/why-did-you-render");
      whyDidYouRender(React, WHY_DID_YOU_RENDER_CONFIG);
    }
  }
};

export const configureApplication = (history: History) => {
  _configureApplicationSync(history);
  configureFontAwesome();
};

export const configureApplicationAsync = async (history: History) => {
  _configureApplicationSync(history);
  await configureFontAwesomeAsync();
};

export default configureApplication;
