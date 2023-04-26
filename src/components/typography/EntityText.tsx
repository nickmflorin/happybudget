import { useMemo } from "react";

import classNames from "classnames";

import {
  isModelWithIdentifier,
  isModelWithName,
  isModelWithDescription,
  ApiModel,
} from "lib/model";
import * as ui from "lib/ui/types";

export type EntityTextProps = ui.ComponentProps<{
  readonly fillEmpty?: boolean | string;
  readonly model?: ApiModel;
  readonly description?: string;
  readonly identifier?: string;
}>;

type EntiyTextPartProps = ui.ComponentProps<{
  readonly children?: string | undefined | null;
  readonly fillEmpty?: boolean | string;
}>;

const EntityTextPart = ({ children, fillEmpty, ...props }: EntiyTextPartProps): JSX.Element => (
  <span {...props}>
    {children !== undefined
      ? children
      : fillEmpty === false
      ? ""
      : fillEmpty === true
      ? "----"
      : fillEmpty}
  </span>
);

export const EntityTextIdentifier = (props: EntiyTextPartProps): JSX.Element => (
  <EntityTextPart {...props} className={classNames("entity-text__identifier", props.className)} />
);

export const EntityTextDescription = ({
  withIdentifier,
  ...props
}: EntiyTextPartProps & { readonly withIdentifier?: boolean }): JSX.Element => (
  <EntityTextPart
    {...props}
    className={classNames(
      "entity-text__description",
      { "entity-text__description--with-identifier": withIdentifier },
      props.className,
    )}
  />
);

export const EntityText = ({
  fillEmpty,
  description,
  identifier,
  model,
  ...props
}: EntityTextProps) => {
  const _identifier = useMemo(() => {
    if (identifier !== undefined || model === undefined) {
      return identifier;
    }
    return isModelWithIdentifier(model)
      ? model.identifier
      : isModelWithName(model)
      ? model.name
      : undefined;
  }, [model, identifier]);

  const _description = useMemo(
    () =>
      description !== undefined
        ? description
        : model !== undefined && isModelWithDescription(model)
        ? model.description
        : undefined,
    [model, description],
  );

  return (
    <span {...props} className={classNames("entity-text", props.className)}>
      {(identifier !== undefined || (fillEmpty !== undefined && _description === undefined)) && (
        <EntityTextIdentifier fillEmpty={fillEmpty}>{_identifier}</EntityTextIdentifier>
      )}
      {(_description !== undefined || (fillEmpty !== undefined && _identifier === undefined)) && (
        <EntityTextDescription
          withIdentifier={_identifier !== undefined || fillEmpty !== undefined}
          className={classNames({
            "with-identifier": _identifier !== undefined || fillEmpty !== undefined,
          })}
          fillEmpty={_identifier === undefined && fillEmpty !== undefined}
        >
          {_description}
        </EntityTextDescription>
      )}
    </span>
  );
};
