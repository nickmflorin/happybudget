import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { CaptureConsole } from "@sentry/integrations";

const configureSentry = () => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    console.info("Configuring Sentry");
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [
        new Integrations.BrowserTracing(),
        new CaptureConsole({
          levels: ["warn", "error"]
        })
      ],
      environment: process.env.REACT_APP_SENTRY_ENV || "development",
      tracesSampleRate: 1.0,
      beforeSend: (event: Sentry.Event) => {
        // Allows us to disable Sentry for a single line of code.
        if (event.extra?.ignore === true) {
          return null;
        }
        return event;
      }
    });
  } else {
    console.info("Skipping Sentry Configuration; No DSN defined.");
  }
};

export default configureSentry;
