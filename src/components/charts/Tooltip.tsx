import { isNil } from "lodash";
import React, { useMemo } from "react";

import "./Tooltip.scss";

interface TooltipLineProps {
  readonly label: string | number;
  readonly value: string | number;
  readonly labelPrefix?: string;
}

const TooltipLine = (props: TooltipLineProps): JSX.Element => {
  const label = useMemo(
    () => (isNil(props.labelPrefix) ? `${props.label}:` : `${props.labelPrefix} ${props.label}:`),
    [props.label, props.labelPrefix]
  );
  return (
    <div className={"tooltip-line"}>
      <div className={"tooltip-line-label"}>{label}</div>
      <div className={"tooltip-line-value"}>{props.value}</div>
    </div>
  );
};

interface TooltipProps<D extends Charts.Datum = Charts.Datum> {
  readonly datum?: D;
  readonly label?: string | number;
  readonly value?: string | number;
  readonly labelPrefix?: string;
}

const Tooltip = <D extends Charts.Datum = Charts.Datum>(props: TooltipProps<D>): JSX.Element => {
  return (
    <div className={"tooltip"}>
      <TooltipLine
        labelPrefix={props.labelPrefix}
        label={!isNil(props.label) ? props.label : props.datum?.label || ""}
        value={!isNil(props.value) ? props.value : props.datum?.value || ""}
      />
    </div>
  );
};

export default React.memo(Tooltip) as typeof Tooltip;
