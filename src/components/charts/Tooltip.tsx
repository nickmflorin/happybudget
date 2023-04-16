import { ui, formatters } from "lib";

type TooltipLineProps<D extends ui.ChartDatum = ui.ChartDatum> = {
  readonly label: string | number;
  readonly value: D["value"] | string;
  readonly labelPrefix?: string;
  readonly valueFormatter?: formatters.Formatter<D["value"] | string>;
};

const TooltipLine = (props: TooltipLineProps): JSX.Element => (
  <div className="tooltip-line">
    <div className="tooltip-line-label">
      {props.labelPrefix === undefined ? `${props.label}:` : `${props.labelPrefix} ${props.label}:`}
    </div>
    <div className="tooltip-line-value">
      {props.valueFormatter !== undefined
        ? props.valueFormatter({ value: props.value })
        : props.value}
    </div>
  </div>
);

type TooltipProps<D extends ui.ChartDatum = ui.ChartDatum> = {
  readonly datum?: D;
  readonly label?: string | number;
  readonly value?: D["value"] | string;
  readonly labelPrefix?: string;
  readonly valueFormatter?: formatters.Formatter<D["value"] | string>;
};

export const Tooltip = <D extends ui.ChartDatum = ui.ChartDatum>(
  props: TooltipProps<D>,
): JSX.Element => (
  <div className="chart-tooltip">
    <TooltipLine
      labelPrefix={props.labelPrefix}
      valueFormatter={props.valueFormatter}
      label={props.label !== undefined ? props.label : props.datum?.label || ""}
      value={props.value !== undefined ? props.value : props.datum?.value || ""}
    />
  </div>
);
