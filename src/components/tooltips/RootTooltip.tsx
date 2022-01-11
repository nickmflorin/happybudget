import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { Tooltip as AntdTooltip } from "antd";

import { TextWithIncludedLink } from "components/typography";

const RootTooltip = ({ children, ...props }: TooltipProps): JSX.Element => {
  const title = useMemo(() => {
    if (!isNil(props.includeLink)) {
      if (typeof props.title !== "string") {
        console.warn("Cannot include link in tooltip when the title is not a string.");
        return props.title;
      }
      return <TextWithIncludedLink includeLink={props.includeLink}>{props.title}</TextWithIncludedLink>;
    }
    return props.title;
  }, [props.title, props.includeLink]);
  return (
    <AntdTooltip {...props} title={title} overlayClassName={classNames("tooltip", props.overlayClassName)}>
      {children}
    </AntdTooltip>
  );
};

export default RootTooltip;
