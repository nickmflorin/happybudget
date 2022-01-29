import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { CaptureConsole, ExtraErrorData } from "@sentry/integrations";
import SentryRRWeb from "@sentry/rrweb";

const configureSentry = () => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.configureScope((scope: Sentry.Scope) => {
      scope.setTag("userAgent", window.navigator.userAgent);
    });
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      normalizeDepth: 4,
      integrations: [
        new Integrations.BrowserTracing(),
        new CaptureConsole({
          levels: ["warn", "error"]
        }),
        new ExtraErrorData({
          /* Limit of how deep the object serializer should go. Anything deeper
					   than limit will be replaced with standard Node.js REPL notation of
						 [Object], [Array], [Function] or a primitive value. Defaults to 3.
             When changing this value, make sure to update `normalizeDepth` of
						 the whole SDK to `depth + 1` in order to get it serialized properly.
						 */
          depth: 3
        }),
        new SentryRRWeb()
      ],
      denyUrls: [
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i
      ],
      ignoreErrors: [
        // Random plugins/extensions
        "top.GLOBALS"
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
