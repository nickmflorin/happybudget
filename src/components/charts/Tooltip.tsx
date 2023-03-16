import React, { useMemo } from "react";

import { isNil } from "lodash";

type TooltipLineProps = {
  readonly label: string | number;
  readonly value: string | number;
  readonly labelPrefix?: string;
  readonly valueFormatter?: (v: string | number) => string | number;
};

const TooltipLine = React.memo((props: TooltipLineProps): JSX.Element => {
  const label = useMemo(
    () => (isNil(props.labelPrefix) ? `${props.label}:` : `${props.labelPrefix} ${props.label}:`),
    [props.label, props.labelPrefix],
  );
  const value = useMemo(
    () => (!isNil(props.valueFormatter) ? props.valueFormatter(props.value) : props.value),
    [props.value, props.valueFormatter],
  );
  return (
    <div className="tooltip-line">
      <div className="tooltip-line-label">{label}</div>
      <div className="tooltip-line-value">{value}</div>
    </div>
  );
});

type TooltipProps<D extends Charts.Datum = Charts.Datum> = {
  readonly datum?: D;
  readonly label?: string | number;
  readonly value?: string | number;
  readonly labelPrefix?: string;
  readonly valueFormatter?: (v: string | number) => string | number;
};

const Tooltip = <D extends Charts.Datum = Charts.Datum>(props: TooltipProps<D>): JSX.Element => (
  <div className="chart-tooltip">
    <TooltipLine
      labelPrefix={props.labelPrefix}
      valueFormatter={props.valueFormatter}
      label={!isNil(props.label) ? props.label : props.datum?.label || ""}
      value={!isNil(props.value) ? props.value : props.datum?.value || ""}
    />
  </div>
);

export default React.memo(Tooltip) as typeof Tooltip;
