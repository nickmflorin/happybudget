import { useEffect, useState } from "react";

type ConfigureModule = {
  configureClientApplicationAsync: () => Promise<void>;
};

export const useAsyncClientConfiguration = (): [boolean] => {
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    /* FontAwesome's "@fortawesome/fontawesome-svg-core" library is very large and causes the size
       of the initial bundle sent to the browser to be very large.  To avoid this, we instead
       dynamically import and perform the Font Awesome configuration to avoid a very large initial
       bundle. */
    import("application/config/configuration/client").then((m: ConfigureModule) => {
      m.configureClientApplicationAsync()
        .then(() => {
          setConfigured(true);
        })
        .catch((e: unknown) => {
          if (e instanceof Error) {
            throw new Error(`Client Configuration Error: ${e}`);
          } else {
            throw new Error("Unknown Client Configuration Error");
          }
        });
    });
  }, []);

  return [configured];
};
