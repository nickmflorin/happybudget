import React, { useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { isNil } from "lodash";
import { Pagination } from "antd";

import { Page } from "components/layout";
import { CreateBudgetModal } from "components/modals";

import { actions } from "../../store";

import Discover from "./Discover";
import MyTemplates from "./MyTemplates";
import TemplatesMenu from "./TemplatesMenu";

const selectTemplatesPage = (state: Application.Authenticated.Store) => state.dashboard.templates.page;
const selectTemplatesPageSize = (state: Application.Authenticated.Store) => state.dashboard.templates.pageSize;
const selectTemplatesCount = (state: Application.Authenticated.Store) => state.dashboard.templates.count;
const selectCommunityTemplatesPage = (state: Application.Authenticated.Store) => state.dashboard.community.page;
const selectCommunityTemplatesPageSize = (state: Application.Authenticated.Store) => state.dashboard.community.pageSize;
const selectCommunityTemplatesCount = (state: Application.Authenticated.Store) => state.dashboard.community.count;

const Templates = (): JSX.Element => {
  const [templateToDerive, setTemplateToDerive] = useState<number | undefined>(undefined);
  const dispatch = useDispatch();
  const history = useHistory();

  const currentTemplatesPage = useSelector(selectTemplatesPage);
  const currentTemplatesPageSize = useSelector(selectTemplatesPageSize);
  const templatesCount = useSelector(selectTemplatesCount);
  const currentCommunityTemplatesPage = useSelector(selectCommunityTemplatesPage);
  const currentCommunityTemplatesPageSize = useSelector(selectCommunityTemplatesPageSize);
  const communityTemplatesCount = useSelector(selectCommunityTemplatesCount);

  return (
    <React.Fragment>
      <Page className={"templates"} title={"New Project"} subTitle={<TemplatesMenu />} contentScrollable={true}>
        <Switch>
          <Route
            path={"/templates"}
            render={(props: any) => <MyTemplates setTemplateToDerive={setTemplateToDerive} />}
          />
          <Route path={"/discover"} render={(props: any) => <Discover setTemplateToDerive={setTemplateToDerive} />} />
        </Switch>
        <Page.Footer>
          <Pagination
            hideOnSinglePage={false}
            showSizeChanger={true}
            defaultPageSize={
              history.location.pathname === "/templates" ? currentTemplatesPageSize : currentCommunityTemplatesPageSize
            }
            defaultCurrent={
              history.location.pathname === "/templates" ? currentTemplatesPage : currentCommunityTemplatesPage
            }
            total={history.location.pathname === "/templates" ? templatesCount : communityTemplatesCount}
            onChange={(page: number, pageSize: number | undefined) => {
              if (history.location.pathname === "/templates") {
                dispatch(actions.setTemplatesPaginationAction(pageSize === undefined ? { page } : { page, pageSize }));
              } else {
                dispatch(
                  actions.setCommunityTemplatesPaginationAction(pageSize === undefined ? { page } : { page, pageSize })
                );
              }
            }}
          />
        </Page.Footer>
      </Page>
      {!isNil(templateToDerive) && (
        <CreateBudgetModal
          open={true}
          templateId={templateToDerive}
          onCancel={() => setTemplateToDerive(undefined)}
          title={"Create Budget from Template"}
          onSuccess={(budget: Model.Budget) => {
            setTemplateToDerive(undefined);
            dispatch(actions.addBudgetToStateAction(budget));
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Templates;
