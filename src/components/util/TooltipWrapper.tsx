import { ReactNode } from "react";
import { isNil } from "lodash";
import { Tooltip } from "antd";
import { TooltipPropsWithTitle } from "antd/lib/tooltip";

interface TooltipWrapperProps extends Partial<TooltipPropsWithTitle> {
  children?: ReactNode;
}

const TooltipWrapper = ({ children, ...props }: TooltipWrapperProps): JSX.Element => {
  if (!isNil(props.title)) {
    return (
      <Tooltip title={props.title} {...props}>
        <div>{children}</div>
      </Tooltip>
    );
  } else {
    return <div>{children}</div>;
  }
};

export default TooltipWrapper;
