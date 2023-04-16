import { ReactNode } from "react";

import classNames from "classnames";

import { ui, model } from "lib";
import { EntityText, EntityTextProps } from "components/typography";

import { RootTooltip } from "./RootTooltip";

export type EntityTooltipProps = Omit<ui.TooltipProps, "content"> & {
  readonly model: model.ApiModel;
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
