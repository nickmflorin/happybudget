import { ReactNode } from "react";
import classNames from "classnames";

import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./LoadableCell.scss";

interface LoadableCellWrapperProps {
  children: ReactNode;
  loading?: boolean;
}

const LoadableCellWrapper = ({ children, loading }: LoadableCellWrapperProps): JSX.Element => {
  const loadingIcon = <LoadingOutlined spin />;

  return (
    <div className={classNames("loadable-cell", { loading })}>
      <span>
        {loading && <Spin className={"loadable-cell-spinner"} indicator={loadingIcon} size={"small"} />}
        <span className={"text"}>{children}</span>
      </span>
    </div>
  );
};

export default LoadableCellWrapper;
