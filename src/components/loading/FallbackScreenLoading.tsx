import React from "react";

import { LoadingOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { Spin } from "antd";

import * as ui from "lib/ui/types";

import { Spinner, RenderProps } from "./Spinner";

const _FallbackScreenLoading = (props: ui.ComponentProps): JSX.Element => (
  <div {...props} className={classNames("loading", "loading--screen", props.className)}>
    <Spinner
      loading={true}
      render={(renderProps: RenderProps) => (
        <Spin {...renderProps} spinning={true} indicator={<LoadingOutlined spin />} />
      )}
    />
  </div>
);

/**
 * A component that takes up the entire screen/viewport and centers a loading indicator in its
 * center that does not depend on the "@fortawesome/fontawesome-svg-core" package.  This component
 * should be used in cases where we cannot render the application content because FontAwesome is
 * being dynamically configured.
 *
 * The component relies on an svg that is imported from "@ant-design/icons" instead of FontAwesome,
 * such that it can be used when FontAwesome is not available yet.
 */
export const FallbackScreenLoading = React.memo(_FallbackScreenLoading);
