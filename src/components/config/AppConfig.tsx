import React, { ReactNode } from "react";

import { Provider } from "react-redux";
/* FontAwesome's stylesheet must be imported, before any internal components or stylesheets are
   imported. */
import "@fortawesome/fontawesome-svg-core/styles.css";

import { FallbackScreenLoading, ConnectedAppLoading } from "components/loading";

import { AntDConfig } from "./AntDConfig";
import { SWRConfig } from "./SWRConfig";
import { useFontAwesome } from "./useFontAwesome";
import { useSegment } from "./useSegment";
import { useStore } from "./useStore";

export type AppConfigProps = {
  readonly children: ReactNode;
  readonly authenticated: boolean;
};

export const AppConfig = (props: AppConfigProps) => {
  const [fontAwesomeConfigured] = useFontAwesome();
  useSegment();
  // When we hook up the public store, the authenticated prop will control the isPublic parameter.
  const store = useStore({ isPublic: false });

  return (
    <AntDConfig>
      {fontAwesomeConfigured === true && store !== null ? (
        <Provider store={store}>
          <React.Fragment>
            <ConnectedAppLoading />
            <SWRConfig>{props.children}</SWRConfig>
          </React.Fragment>
        </Provider>
      ) : (
        <FallbackScreenLoading />
      )}
    </AntDConfig>
  );
};
