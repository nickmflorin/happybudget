import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { Tooltip as AntdTooltip } from "antd";

import { TextWithIncludedLink } from "components/typography";
import ItemizedTooltipContent from "./ItemizedTooltipContent";

const RootTooltip = ({ children, ...props }: TooltipProps): JSX.Element => {
  const title = useMemo(() => {
    if (!isNil(props.includeLink) && typeof props.content !== "string") {
      console.warn("Cannot include link in tooltip when the title is not a string.");
    }
    if (typeof props.content === "string") {
      if (!isNil(props.includeLink)) {
        return <TextWithIncludedLink includeLink={props.includeLink}>{props.content}</TextWithIncludedLink>;
      }
      return props.content;
    } else if (Array.isArray(props.content)) {
      return <ItemizedTooltipContent items={props.content} formatter={props.valueFormatter} />;
    }
    return props.content;
  }, [props.content, props.includeLink, props.valueFormatter]);
  return (
    <AntdTooltip {...props} title={title} overlayClassName={classNames("tooltip", props.overlayClassName)}>
      {children}
    </AntdTooltip>
  );
};

export default RootTooltip;
