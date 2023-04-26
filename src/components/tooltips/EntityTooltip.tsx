import { ReactNode } from "react";

import classNames from "classnames";

import { ApiModel } from "lib/model";
import * as tooltip from "lib/ui/tooltip/types";
import { EntityText, EntityTextProps } from "components/typography";

import { RootTooltip } from "./RootTooltip";

export type EntityTooltipProps = Omit<tooltip.TooltipProps, "content"> & {
  readonly model: ApiModel;
  readonly children: ReactNode;
} & Pick<EntityTextProps, "fillEmpty">;

export const EntityTooltip = ({
  children,
  model,
  fillEmpty,
  ...props
}: EntityTooltipProps & { readonly children: ReactNode }): JSX.Element => (
  <RootTooltip
    {...props}
    overlayClassName={classNames("tooltip--entity", props.overlayClassName)}
    content={<EntityText model={model} fillEmpty={fillEmpty} />}
  >
    {children}
  </RootTooltip>
);
