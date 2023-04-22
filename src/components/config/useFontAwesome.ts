import { useEffect, useState } from "react";

type ConfigureModule = {
  configureApplicationAsync: () => Promise<void>;
};

export const useFontAwesome = (): [boolean] => {
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    /* FontAwesome's "@fortawesome/fontawesome-svg-core" library is very large and causes the size
       of the initial bundle sent to the browser to be very large.  To avoid this, we instead
       dynamically import and perform the Font Awesome configuration to avoid a very large initial
       bundle. */
    import("application/config/configuration").then((m: ConfigureModule) => {
      m.configureApplicationAsync()
        .then(() => {
          setConfigured(true);
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

  return [configured];
};
