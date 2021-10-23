import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { CaptureConsole } from "@sentry/integrations";

const configureSentry = () => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    /* eslint-disable no-console */
    console.log("Configuring Sentry");
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [
        new Integrations.BrowserTracing(),
        new CaptureConsole({
          levels: ["warn", "error"]
        })
      ],
      environment: process.env.REACT_APP_SENTRY_ENV || "development",
      tracesSampleRate: 0.1
    });
  } else {
    /* eslint-disable no-console */
    console.log("Skipping Sentry Configuration; No DSN defined.");
  }
};

export default configureSentry;
