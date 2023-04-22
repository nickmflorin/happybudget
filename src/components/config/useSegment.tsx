import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { parseEnvVar } from "application/config";
import { logger } from "internal";

const SEGMENT_ENABLED = parseEnvVar(
  process.env.NEXT_PUBLIC_SEGMENT_ENABLED,
  "NEXT_PUBLIC_SEGMENT_ENABLED",
  { type: "boolean" },
);

export const useSegment = () => {
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
};
