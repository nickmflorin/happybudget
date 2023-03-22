import { useEffect, useState } from "react";

/* FontAwesome's stylesheet must be imported, before any internal components or stylesheets are
   imported. */
import "@fortawesome/fontawesome-svg-core/styles.css";

import { ScreenLoading } from "components/loading";

import { AntDConfig } from "./AntDConfig";
import { SWRConfig } from "./SWRConfig";

type ConfigureModule = {
  default: () => Promise<void>;
};

export const AppConfig = (props: { children: JSX.Element }) => {
  const [fontAwesomeConfigured, setFontAwesomeConfigured] = useState(false);

  useEffect(() => {
    /* FontAwesome's "@fortawesome/fontawesome-svg-core" library is very large and causes the size
       of the initial bundle sent to the browser to be very large.  To avoid this, we instead
       dynamically import and perform the Font Awesome configuration to avoid a very large initial
       bundle.

       The default export from the "config/fontAwesome/configure" file should be the asynchronous
       configuration method.
       */
    import("application/config/configuration/fontAwesome").then((module: ConfigureModule) => {
      module
        .default()
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
      <AntDConfig>{fontAwesomeConfigured ? props.children : <ScreenLoading />}</AntDConfig>
    </SWRConfig>
  );
};
