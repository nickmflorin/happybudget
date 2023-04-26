"use client";
import React from "react";

import { ConfigProvider } from "antd";

type RootConfigProviderProps = React.ComponentProps<typeof ConfigProvider>;

/**
An extension of AntD's {@link ConfigProvider} that holds certain configuration properties constant
for purposes of both development and testing.
(1) Hashed
    AntD will manipulate class names by affixing them with random hashes for purposes of isolation.
    However, their intention in doing this is that you would be using every aspect of their
    framework which has the inherent expectation that we define configuration values for their
    framework, like colors or sizes, in JS or TS - but do not want to more granularly override
    styles in SASS.  This does not work for us, for the following two reasons:
    - The non-deterministic class names make it impossible to test.
    - It introduces a significant layer of complexity when trying to override styles in SASS.
 */
export const AntDConfig = (props: Omit<RootConfigProviderProps, "theme">): JSX.Element => (
  <ConfigProvider {...props} theme={{ hashed: false }} />
);
