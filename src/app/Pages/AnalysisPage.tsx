import React from "react";

import { budgeting } from "lib";

import { Portal, BreadCrumbs } from "components/layout";

interface AnalysisPageProps {
  readonly budget: Model.Budget | null;
  readonly children: React.ReactChild | React.ReactChild[];
}

const AnalysisPage = ({ budget, children }: AnalysisPageProps): JSX.Element => {
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
                label: "Analysis",
                url: `${budgeting.urls.getUrl(b)}/analysis`
              })
            }
          ]}
        />
      </Portal>
      {children}
    </React.Fragment>
  );
};

export default React.memo(AnalysisPage);
