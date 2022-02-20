import React from "react";
import classNames from "classnames";
import { Spin, SpinProps } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { withSize } from "components/hocs";

type PrivateSpinnerProps = Omit<SpinProps, "indicator" | "size"> & {
  readonly color?: Style.HexColor;
};

export type SpinnerProps = PrivateSpinnerProps & UseSizeProps;

const Spinner = ({ className, color, ...props }: PrivateSpinnerProps): JSX.Element => (
  <Spin
    {...props}
    className={classNames("spinner", className)}
    indicator={<LoadingOutlined style={{ color: color }} spin />}
  />
);

export default withSize<SpinnerProps>()(React.memo(Spinner));
