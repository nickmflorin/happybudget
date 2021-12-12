import React from "react";

import { budgeting } from "lib";

import { Portal, BreadCrumbs } from "components/layout";

interface ActualsPageProps {
  readonly budget: Model.Budget | null;
  readonly children: React.ReactChild | React.ReactChild[];
}

const ActualsPage = ({ budget, children }: ActualsPageProps): JSX.Element => {
  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ b: budget }}
          items={[
            {
              requiredParams: ["b"],
              func: ({ b }: { b: Model.Budget }) => ({
                id: b.id,
                primary: true,
                label: b.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(b)
              })
            },
            {
              requiredParams: ["b"],
              func: ({ b }: { b: Model.Budget }) => ({
                id: b.id,
                label: "Actuals Log",
                url: `${budgeting.urls.getUrl(b, "base")}/actuals`
              })
            }
          ]}
        />
      </Portal>
      {children}
    </React.Fragment>
  );
};

export default React.memo(ActualsPage);
