import React, { useMemo } from "react";

import classNames from "classnames";
import { isNil } from "lodash";

import { model as libmodel } from "lib";

export type EntityTextProps = StandardComponentProps & {
  readonly children?: Model.HttpModel;
  readonly fillEmpty?: boolean | string;
  readonly model?: Model.HttpModel;
  readonly description?: string;
  readonly identifier?: string;
};

type EntiyTextPartProps = StandardComponentProps & {
  readonly children?: string | undefined | null;
  readonly fillEmpty?: boolean | string;
};

export const EntityTextPart = ({
  children,
  fillEmpty,
  ...props
}: EntiyTextPartProps): JSX.Element => {
  const _children = useMemo(() => {
    if (!isNil(children)) {
      return children;
    } else if (fillEmpty === false) {
      return "";
    } else {
      return fillEmpty === true ? "----" : fillEmpty;
    }
  }, [children, fillEmpty]);

  return <span {...props}>{_children}</span>;
};

export const EntityTextDescription = (props: EntiyTextPartProps): JSX.Element => (
  <EntityTextPart {...props} className={classNames("entity-text-description", props.className)} />
);

export const EntityTextIdentifier = (props: EntiyTextPartProps): JSX.Element => (
  <EntityTextPart {...props} className={classNames("entity-text-identifier", props.className)} />
);

const EntityText: React.FC<EntityTextProps> = ({
  children,
  fillEmpty,
  description,
  identifier,
  model,
  ...props
}) => {
  const entityModel = useMemo(
    () => (!isNil(model) ? model : !isNil(children) ? children : null),
    [model, children],
  );

  const _identifier = useMemo(() => {
    if (!isNil(identifier)) {
      return identifier;
    } else if (!isNil(entityModel)) {
      return libmodel.isModelWithIdentifier(entityModel)
        ? entityModel.identifier
        : libmodel.isModelWithName(entityModel)
        ? entityModel.name
        : undefined;
    }
    return undefined;
  }, [entityModel, identifier]);

  const _description = useMemo(
    () =>
      !isNil(description)
        ? description
        : !isNil(entityModel) && libmodel.isModelWithDescription(entityModel)
        ? entityModel.description
        : undefined,
    [entityModel, description],
  );

  return (
    <span {...props} className={classNames("entity-text", props.className)}>
      {(!isNil(_identifier) || (!isNil(fillEmpty) && isNil(_description))) && (
        <EntityTextIdentifier fillEmpty={fillEmpty}>{_identifier}</EntityTextIdentifier>
      )}
      {(!isNil(_description) || (!isNil(fillEmpty) && isNil(_identifier))) && (
        <EntityTextDescription
          className={classNames({ "with-identifier": !isNil(_identifier) || !isNil(fillEmpty) })}
          fillEmpty={isNil(_identifier) && !isNil(fillEmpty)}
        >
          {_description}
        </EntityTextDescription>
      )}
    </span>
  );
};

export default React.memo(EntityText);
