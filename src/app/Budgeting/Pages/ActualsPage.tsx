import React from "react";

import { budgeting } from "lib";
import { Portal, BreadCrumbs } from "components/layout";

interface ActualsPageProps {
  readonly budget: Model.Budget | null;
  readonly children: React.ReactChild | React.ReactChild[];
}

const ActualsPage = ({ budget, children }: ActualsPageProps): JSX.Element => (
  <React.Fragment>
    <Portal id="breadcrumbs">
      <BreadCrumbs<{ b: Model.Budget }>
        params={{ b: budget }}
        items={[
          {
            requiredParams: ["b"],
            func: ({ b }: { b: Model.Budget }) => ({
              id: b.id,
              primary: true,
              label: b.name,
              tooltip: { content: "Top Sheet", placement: "bottom" },
              url: budgeting.urls.getUrl(b),
            }),
          },
          {
            requiredParams: ["b"],
            func: ({ b }: { b: Model.Budget }) => ({
              id: b.id,
              label: "Actuals Log",
              url: `/budgets/${b.id}/actuals`,
            }),
          },
        ]}
      />
    </Portal>
    {children}
  </React.Fragment>
);

export default React.memo(ActualsPage);
