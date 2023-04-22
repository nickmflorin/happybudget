import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

/* FontAwesome's stylesheet must be imported, before any internal components or stylesheets are
   imported. */
import "@fortawesome/fontawesome-svg-core/styles.css";

import { parseEnvVar } from "application/config";
import { logger } from "internal";
import { FallbackScreenLoading } from "components/loading";

import { AntDConfig } from "./AntDConfig";
import { StoreConfig } from "./StoreConfig";
import { SWRConfig } from "./SWRConfig";

type ConfigureModule = {
  configureApplicationAsync: () => Promise<void>;
};

export type AppConfigProps = {
  readonly children: JSX.Element;
  readonly authenticated: boolean;
};

const SEGMENT_ENABLED = parseEnvVar(
  process.env.NEXT_PUBLIC_SEGMENT_ENABLED,
  "NEXT_PUBLIC_SEGMENT_ENABLED",
  { type: "boolean" },
);

export const AppConfig = (props: AppConfigProps) => {
  const [fontAwesomeConfigured, setFontAwesomeConfigured] = useState(false);
  const router = useRouter();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      logger.debug(`Router URL is changing to ${url}.`);
      if (SEGMENT_ENABLED === true) {
        /* TODO: Do we need to worry about the URL only changing query parameters or other non-path
           related changes? */
        if (prevPath.current === null || prevPath.current !== url) {
          prevPath.current = url;
          if (window.analytics !== undefined) {
            window.analytics.page();
          } else {
            logger.error("Segment is not properly configured on the global window object.");
          }
        }
      }
    };
    // Listen and notify Segment of client-side page updates.
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    /* FontAwesome's "@fortawesome/fontawesome-svg-core" library is very large and causes the size
       of the initial bundle sent to the browser to be very large.  To avoid this, we instead
       dynamically import and perform the Font Awesome configuration to avoid a very large initial
       bundle. */
    import("application/config/configuration").then((m: ConfigureModule) => {
      m.configureApplicationAsync()
        .then(() => {
          setFontAwesomeConfigured(true);
        })
        .catch((e: unknown) => {
          if (e instanceof Error) {
            throw new Error(`Font Awesome Configuration Error: ${e}`);
          } else {
            throw new Error("Unknown Font Awesome Configuration Error");
          }
        });
    });
  }, []);

  return (
    <SWRConfig>
      <AntDConfig>
        {fontAwesomeConfigured ? (
          <StoreConfig isPublic={false}>{props.children}</StoreConfig>
        ) : (
          <FallbackScreenLoading />
        )}
      </AntDConfig>
    </SWRConfig>
  );
};
