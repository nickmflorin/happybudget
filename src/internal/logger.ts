import { createLogWriter as createBrowserLogWriter } from "@roarr/browser-log-writer";
import { intersection } from "lodash";
import { Roarr as Logger, MessageContext, Message } from "roarr";
import { ulid } from "ulid";

/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { ProductionEnvironments } from "lib/application/types";

const RESTRICTED_LOG_CONTEXT = ["application", "environment", "productionEnv"] as const;

// The `instanceId` is used to correlate logs in a high concurrency environment.
const instanceId = ulid();

/* Only log to the browser console if the ENV variable is explicitly true and we are not in the
   server environment.  NEXT_PUBLIC_ROARR_BROWSER_LOG is exposed in both the server and in the
   browser, so if we do not ensure we are on the server then we will be incidentally overwriting
   ROARR.write to write to the browser when we are on the server.

	 To ensure we are not on the server, we can simply check if the window is defined.
	 */
if (process.env.NEXT_PUBLIC_ROARR_BROWSER_LOG === "true" && typeof window !== "undefined") {
  ROARR.write = createBrowserLogWriter();
  /* When using @roarr/browser-log-writer, roarr logging (which is turned off by default) is
     controlled by the value of `ROARR_LOG` in local storage - not an environment variable. */
  window.localStorage.setItem("ROARR_LOG", "true");
}

const productionEnv = process.env.NEXT_PUBLIC_PRODUCTION_ENV;
if (productionEnv === undefined || !ProductionEnvironments.contains(productionEnv)) {
  throw new TypeError(`Detected invalid value '${productionEnv}' for NEXT_PUBLIC_PRODUCTION_ENV.`);
}

const application = process.env.npm_package_name;
if (application === undefined) {
  throw new TypeError(`Detected invalid value '${application}' for npm_package_name.`);
}

export default Logger.child<MessageContext>((message: Message<MessageContext>) => {
  const inter = intersection(Object.keys(message.context), RESTRICTED_LOG_CONTEXT);
  if (inter.length > 0) {
    throw new Error(`The log context key(s) '${inter.join(", ")} are restricted.`);
  }
  return {
    ...message,
    context: {
      ...message.context,
      application,
      instanceId,
      productionEnv,
    },
  };
});
