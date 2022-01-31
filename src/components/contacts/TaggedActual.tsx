import React, { ReactNode } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { util } from "lib";
import { RouterLink } from "components/links";
import { EntityText } from "components/typography";

import "./TaggedActual.scss";

type TaggedActualDetailProps = StandardComponentProps & {
  readonly field: string;
  readonly children: ReactNode;
};

const TaggedActualDetail = React.memo(({ field, children, ...props }: TaggedActualDetailProps): JSX.Element => {
  return (
    <div {...props} className={classNames("tagged-actual-detail", props.className)}>
      <div className={"tagged-actual-detail-field"}>{field}</div>
      <div className={"tagged-actual-detail-value"}>{children}</div>
    </div>
  );
});

type TaggedActualProps = StandardComponentProps & {
  readonly taggedActual: Model.TaggedActual;
};

const TaggedActual = ({ taggedActual, ...props }: TaggedActualProps): JSX.Element => {
  return (
    <div {...props} className={classNames("tagged-actual", props.className)}>
      <RouterLink className={"tagged-actual-title avenir"} dark={true} to={`/budgets/${taggedActual.budget.id}`}>
        {taggedActual.budget.name}
      </RouterLink>
      <div className={"tagged-actual-details"}>
        <TaggedActualDetail field={"Account"} style={{ flexGrow: 100 }}>
          {!isNil(taggedActual.owner) && <EntityText>{taggedActual.owner}</EntityText>}
        </TaggedActualDetail>
        <TaggedActualDetail field={"Date"} style={{ width: "30%" }}>
          {!isNil(taggedActual.date) && util.dates.toAbbvDisplayDateTime(taggedActual.date)}
        </TaggedActualDetail>
        <TaggedActualDetail field={"Paid"} style={{ width: "15%" }}>
          {util.formatters.formatAsCurrency(taggedActual.value)}
        </TaggedActualDetail>
      </div>
    </div>
  );
};

export default React.memo(TaggedActual);
