import { ReactNode, useMemo } from "react";

import classNames from "classnames";
import { Tooltip as AntdTooltip } from "antd";

import { logger } from "internal";
import * as tooltip from "lib/ui/tooltip/types";

// import { TextWithIncludedLink } from "components/typography";

import { ItemizedTooltipContent } from "./ItemizedTooltipContent";

export const RootTooltip = ({
  children,
  ...props
}: tooltip.TooltipProps & { readonly children: ReactNode }): JSX.Element => {
  const title = useMemo(() => {
    if (props.includeLink !== undefined && typeof props.content !== "string") {
      logger.warn("Cannot include link in tooltip when the title is not a string.");
    }
    if (typeof props.content === "string") {
      /* if (props.includeLink !== undefined) {
           return (
             <TextWithIncludedLink includeLink={props.includeLink}>
               {props.content}
             </TextWithIncludedLink>
           );
         } */
      return props.content;
    } else if (Array.isArray(props.content)) {
      return <ItemizedTooltipContent items={props.content} formatter={props.valueFormatter} />;
    }
    return props.content;
  }, [props.content, props.includeLink, props.valueFormatter]);
  return (
    <AntdTooltip
      {...props}
      title={title}
      overlayClassName={classNames("tooltip", props.overlayClassName)}
    >
      {children}
    </AntdTooltip>
  );
};
