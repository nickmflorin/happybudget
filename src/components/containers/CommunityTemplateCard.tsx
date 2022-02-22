import React, { useEffect } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import Card, { CardProps } from "./Card";

type CommunityTemplateCardProps = Pick<
  CardProps,
  "disabled" | "loading" | "onClick" | "className" | "style" | "cornerActions"
> & {
  budget: Model.SimpleTemplate;
};

const CommunityTemplateCard = ({ budget, loading, ...props }: CommunityTemplateCardProps): JSX.Element => {
  useEffect(() => {
    if (!isNil(budget.image) && isNil(budget.image.url)) {
      console.warn(
        `Community Template ${budget.id} has an image with an undefined URL.
        This most likely means something wonky is going on with S3.`
      );
    }
  }, [budget.image]);

  return (
    <Card
      {...props}
      className={classNames("community-template-card", props.className)}
      title={budget.name}
      tourId={budget.name.replace(" ", "").toLowerCase()}
      loading={loading}
      image={budget.image}
    />
  );
};

export default React.memo(CommunityTemplateCard);
