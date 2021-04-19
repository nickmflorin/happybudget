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
        <span>{children}</span>
      </Tooltip>
    );
  } else {
    return <span>{children}</span>;
  }
};

export default TooltipWrapper;
