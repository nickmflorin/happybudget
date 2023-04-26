import React from "react";

import { logger } from "internal";

import { configure as configureAgGrid } from "./aggrid";
import {
  configure as configureFontAwesome,
  configureAsync as configureFontAwesomeAsync,
} from "./fontAwesome";
import { configureClientSentry } from "./sentry";

type WhyDidYouRenderOptions =
  import("@welldone-software/why-did-you-render").WhyDidYouRenderOptions;

const WHY_DID_YOU_RENDER_CONFIG: WhyDidYouRenderOptions = {
  trackAllPureComponents: true,
  trackHooks: true,
  trackExtraHooks: [[require("react-redux/lib"), "useSelector"]],
};

const _configureClientApplicationSync = () => {
  configureAgGrid();
  configureClientSentry();
  // WYDR is extremely useful in development, but slows down production bundles.
  const WHY_DID_YOU_RENDER = process.env.NEXT_PUBLIC_WHY_DID_YOU_RENDER;
  if (WHY_DID_YOU_RENDER !== undefined && WHY_DID_YOU_RENDER.toLowerCase() === "true") {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const whyDidYouRender = require("@welldone-software/why-did-you-render");
    whyDidYouRender(React, WHY_DID_YOU_RENDER_CONFIG);
  }
};

export const configureClientApplication = () => {
  logger.info("Configuring client application synchronously.");
  _configureClientApplicationSync();
  configureFontAwesome();
};

export const configureClientApplicationAsync = async () => {
  logger.info("Configuring client application asynchronously.");
  _configureClientApplicationSync();
  await configureFontAwesomeAsync();
};
