import { ReactNode } from "react";
import classNames from "classnames";
import { EntityText } from "components/typography";
import { EntityTextProps } from "components/typography/EntityText";
import RootTooltip from "./Tooltip";

export type EntityTooltipProps = Omit<TooltipProps, "title"> & {
  readonly entity: Model.HttpModel;
} & Pick<EntityTextProps, "fillEmpty">;

const EntityTooltip = ({
  children,
  entity,
  fillEmpty,
  ...props
}: EntityTooltipProps & { readonly children: ReactNode }): JSX.Element => (
  <RootTooltip
    {...props}
    overlayClassName={classNames("tooltip--entity", props.overlayClassName)}
    title={<EntityText fillEmpty={fillEmpty}>{entity}</EntityText>}
  >
    {children}
  </RootTooltip>
);

export default EntityTooltip;
