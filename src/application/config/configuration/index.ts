import React from "react";

import { configure as configureAgGrid } from "./aggrid";
import {
  configure as configureFontAwesome,
  configureAsync as configureFontAwesomeAsync,
} from "./fontAwesome";
import { configure as configureSentry } from "./sentry";

type WhyDidYouRenderOptions =
  import("@welldone-software/why-did-you-render").WhyDidYouRenderOptions;

const WHY_DID_YOU_RENDER_CONFIG: WhyDidYouRenderOptions = {
  trackAllPureComponents: true,
  trackHooks: true,
  trackExtraHooks: [[require("react-redux/lib"), "useSelector"]],
};

const _configureApplicationSync = () => {
  configureAgGrid();
  // TODO: Should this be restricted to the server?
  configureSentry();

  // Client specific configuration.
  if (typeof window !== "undefined") {
    // WYDR is extremely useful in development, but slows down production bundles.
    const WHY_DID_YOU_RENDER = process.env.NEXT_PUBLIC_WHY_DID_YOU_RENDER;
    if (WHY_DID_YOU_RENDER !== undefined && WHY_DID_YOU_RENDER.toLowerCase() === "true") {
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
      const whyDidYouRender = require("@welldone-software/why-did-you-render");
      whyDidYouRender(React, WHY_DID_YOU_RENDER_CONFIG);
    }
  }
};

export const configureApplication = () => {
  _configureApplicationSync();
  configureFontAwesome();
};

export const configureApplicationAsync = async () => {
  _configureApplicationSync();
  await configureFontAwesomeAsync();
};
