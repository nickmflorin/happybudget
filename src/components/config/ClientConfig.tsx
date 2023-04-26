"use client";
import React, { ReactNode } from "react";

import { Provider } from "react-redux";
/* FontAwesome's stylesheet must be imported, before any internal components or stylesheets are
   imported. */
import "@fortawesome/fontawesome-svg-core/styles.css";

import { ConnectedAppLoading } from "components/loading/ConnectedAppLoading";
import { FallbackScreenLoading } from "components/loading/FallbackScreenLoading";

import { AntDConfig } from "./AntDConfig";
import { SWRConfig } from "./SWRConfig";
import { useAsyncClientConfiguration } from "./useAsyncClientConfiguration";
import { useSegment } from "./useSegment";
import { useStore } from "./useStore";

export type ClientConfigProps = {
  readonly children: ReactNode;
  readonly authenticated: boolean;
};

export const ClientConfig = (props: ClientConfigProps) => {
  const [configured] = useAsyncClientConfiguration();
  useSegment();
  // When we hook up the public store, the authenticated prop will control the isPublic parameter.
  const store = useStore({ isPublic: false });

  return (
    <AntDConfig>
      {configured === true && store !== null ? (
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
