import { logger, createHotReloadIsolatedFn } from "internal";

import { configure as configureFontAwesome, FAConfigurationOptions } from "./fontAwesome";

export type ConfigurationOptions = {
  fontAwesome: FAConfigurationOptions;
};

export const configureServerApplication = createHotReloadIsolatedFn(
  "serverApplicationConfigured",
  (options: ConfigurationOptions) => {
    logger.info("Configuring server application.");
    configureFontAwesome(options.fontAwesome);
  },
);
