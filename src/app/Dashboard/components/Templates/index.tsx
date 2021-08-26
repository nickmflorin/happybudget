import React, { useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import { Page } from "components/layout";
import { CreateBudgetModal } from "components/modals";

import { addBudgetToStateAction } from "../../store/actions";

import Discover from "./Discover";
import MyTemplates from "./MyTemplates";
import TemplatesMenu from "./TemplatesMenu";

const Templates = (): JSX.Element => {
  const [templateToDerive, setTemplateToDerive] = useState<number | undefined>(undefined);
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <React.Fragment>
      <Page className={"templates"} title={"New Project"} subTitle={<TemplatesMenu />}>
        <Switch>
          <Route
            path={"/templates"}
            render={(props: any) => <MyTemplates setTemplateToDerive={setTemplateToDerive} />}
          />
          <Route path={"/discover"} render={(props: any) => <Discover setTemplateToDerive={setTemplateToDerive} />} />
        </Switch>
      </Page>
      {!isNil(templateToDerive) && (
        <CreateBudgetModal
          open={true}
          templateId={templateToDerive}
          onCancel={() => setTemplateToDerive(undefined)}
          title={"Create Budget from Template"}
          onSuccess={(budget: Model.Budget) => {
            setTemplateToDerive(undefined);
            dispatch(addBudgetToStateAction(budget));
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Templates;
