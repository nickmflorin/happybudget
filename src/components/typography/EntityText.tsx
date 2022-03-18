import React, { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { model } from "lib";

export interface EntityTextProps extends StandardComponentProps {
  readonly children: Model.HttpModel;
  readonly fillEmpty?: boolean | string;
}

type EntiyTextPartProps = StandardComponentProps & {
  readonly children?: string | undefined | null;
  readonly fillEmpty?: boolean | string;
};

export const EntityTextPart = ({ children, fillEmpty, ...props }: EntiyTextPartProps): JSX.Element => {
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

const EntityText: React.FC<EntityTextProps> = ({ children, fillEmpty, ...props }) => {
  const identifier = useMemo(
    () =>
      model.isModelWithIdentifier(children)
        ? children.identifier
        : model.isModelWithName(children)
        ? children.name
        : undefined,
    [children]
  );
  const description = useMemo(
    () => (model.isModelWithDescription(children) ? children.description : undefined),
    [children]
  );

  return (
    <span {...props} className={classNames("entity-text", props.className)}>
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

export default React.memo(EntityText);
