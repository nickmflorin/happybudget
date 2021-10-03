import React, { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { model } from "lib";

import "./EntityText.scss";

export interface EntityTextProps extends StandardComponentProps {
  readonly children: Model.HttpModel;
  readonly fillEmpty?: boolean | string;
}

interface TextProps extends StandardComponentProps {
  readonly children?: string | undefined | null;
  readonly fillEmpty?: boolean | string;
}

export const EntityTextDescription = ({ className, style, ...props }: TextProps): JSX.Element => {
  const children = useMemo(() => {
    if (!isNil(props.children)) {
      return props.children;
    } else if (props.fillEmpty === false) {
      return "";
    } else {
      return props.fillEmpty === true ? "----" : props.fillEmpty;
    }
  }, [props.children, props.fillEmpty]);

  return (
    <span className={classNames("entity-text-description", className)} style={style}>
      {children}
    </span>
  );
};

export const EntityTextIdentifier = ({ className, style, ...props }: TextProps): JSX.Element => {
  const children = useMemo(() => {
    if (!isNil(props.children)) {
      return props.children;
    } else if (props.fillEmpty === false) {
      return "";
    } else {
      return props.fillEmpty === true ? "----" : props.fillEmpty;
    }
  }, [props.children, props.fillEmpty]);
  return (
    <span className={classNames("entity-text-identifier", className)} style={style}>
      {children}
    </span>
  );
};

/* eslint-disable indent */
const EntityText: React.FC<EntityTextProps> = ({ children, className, fillEmpty, style = {} }) => {
  const identifier = useMemo(
    () =>
      model.typeguards.isModelWithIdentifier(children)
        ? children.identifier
        : model.typeguards.isModelWithName(children)
        ? children.name
        : undefined,
    [children]
  );
  const description = useMemo(
    () => (model.typeguards.isModelWithDescription(children) ? children.description : undefined),
    [children]
  );

  return (
    <span className={classNames("entity-text", className)} style={style}>
      {(!isNil(identifier) || !isNil(fillEmpty)) && (
        <EntityTextIdentifier fillEmpty={fillEmpty}>{identifier}</EntityTextIdentifier>
      )}
      {!isNil(description) && (
        <EntityTextDescription className={classNames({ "with-identifier": !isNil(identifier) || !isNil(fillEmpty) })}>
          {description}
        </EntityTextDescription>
      )}
    </span>
  );
};

export default EntityText;
