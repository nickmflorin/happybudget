import { ReactNode } from "react";
import classNames from "classnames";

import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface LoadableCellWrapperProps {
  children: ReactNode;
  loading?: boolean;
}

const LoadableCellWrapper = ({ children, loading }: LoadableCellWrapperProps): JSX.Element => {
  const loadingIcon = <LoadingOutlined spin />;

  return (
    <div className={classNames("loadable-cell-wrapper", { loading })}>
      <span>
        {loading && <Spin className={"loadable-cell-spinner"} indicator={loadingIcon} size={"small"} />}
        {children}
      </span>
    </div>
  );
};

export default LoadableCellWrapper;
