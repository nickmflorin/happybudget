import React, { useState, useEffect } from "react";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { isNil } from "lodash";
import { Pagination } from "antd";

import { Icon } from "components";
import { Button, CircleIconButton } from "components/buttons";
import { SearchInput } from "components/fields";
import { Page } from "components/layout";
import { HorizontalMenu } from "components/menus";
import { IHorizontalMenuItem } from "components/menus/HorizontalMenu";
import { CreateBudgetModal, CreateTemplateModal } from "components/modals";
import { IsStaff } from "components/permissions";

import { actions } from "../../store";

import Discover from "./Discover";
import MyTemplates from "./MyTemplates";
import "./index.scss";

type TemplatesPage = "my-templates" | "discover";

const selectTemplatesPage = (state: Application.Authenticated.Store) => state.dashboard.templates.page;
const selectTemplatesPageSize = (state: Application.Authenticated.Store) => state.dashboard.templates.pageSize;
const selectTemplatesCount = (state: Application.Authenticated.Store) => state.dashboard.templates.count;
const selectCommunityTemplatesPage = (state: Application.Authenticated.Store) => state.dashboard.community.page;
const selectCommunityTemplatesPageSize = (state: Application.Authenticated.Store) => state.dashboard.community.pageSize;
const selectCommunityTemplatesCount = (state: Application.Authenticated.Store) => state.dashboard.community.count;
const selectTemplatesSearch = (state: Application.Authenticated.Store) => state.dashboard.templates.search;
const selectCommunityTemplatesSearch = (state: Application.Authenticated.Store) => state.dashboard.community.search;

const Templates = (): JSX.Element => {
  const [templateToDerive, setTemplateToDerive] = useState<number | undefined>(undefined);
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);
  const [createCommunityTemplateModalOpen, setCreateCommunityTempateModalOpen] = useState(false);
  const [page, setPage] = useState<TemplatesPage | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const currentTemplatesPage = useSelector(selectTemplatesPage);
  const currentTemplatesPageSize = useSelector(selectTemplatesPageSize);
  const templatesCount = useSelector(selectTemplatesCount);
  const currentCommunityTemplatesPage = useSelector(selectCommunityTemplatesPage);
  const currentCommunityTemplatesPageSize = useSelector(selectCommunityTemplatesPageSize);
  const communityTemplatesCount = useSelector(selectCommunityTemplatesCount);
  const templatesSearch = useSelector(selectTemplatesSearch);
  const communitySearch = useSelector(selectCommunityTemplatesSearch);

  useEffect(() => {
    if (location.pathname.startsWith("/templates")) {
      setPage("my-templates");
    } else {
      setPage("discover");
    }
  }, [location.pathname]);

  return (
    <React.Fragment>
      <Page
        className={"templates"}
        pageProps={{ className: "templates-page" }}
        title={"New Project"}
        subMenu={[
          <HorizontalMenu<TemplatesPage>
            className={"templates-menu"}
            itemProps={{ className: "templates-menu-item" }}
            selected={page}
            onChange={(item: IHorizontalMenuItem<TemplatesPage>) => setPage(item.id)}
            items={[
              { id: "discover", label: "Discover", onClick: () => history.push("/discover") },
              { id: "my-templates", label: "My Templates", onClick: () => history.push("/templates") }
            ]}
          />,
          <div className={"search-wrapper"}>
            <SearchInput
              placeholder={"Search Templates..."}
              value={page === "my-templates" ? templatesSearch : communitySearch}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                if (page === "my-templates") {
                  dispatch(actions.setTemplatesSearchAction(event.target.value));
                } else {
                  dispatch(actions.setCommunityTemplatesSearchAction(event.target.value));
                }
              }}
            />
            <CircleIconButton
              className={"btn--primary"}
              icon={<Icon icon={"plus"} weight={"light"} />}
              onClick={() => setCreateBudgetModalOpen(true)}
            />
            <Button
              className={"btn--primary btn-non-circle"}
              icon={<Icon icon={"plus"} weight={"light"} />}
              onClick={() => setCreateBudgetModalOpen(true)}
            >
              {"New Blank Budget"}
            </Button>
          </div>
        ]}
        contentScrollable={true}
      >
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
            onChange={(pg: number, pageSize: number | undefined) => {
              if (history.location.pathname === "/templates") {
                dispatch(
                  actions.setTemplatesPaginationAction(pageSize === undefined ? { page: pg } : { page: pg, pageSize })
                );
              } else {
                dispatch(
                  actions.setCommunityTemplatesPaginationAction(
                    pageSize === undefined ? { page: pg } : { page: pg, pageSize }
                  )
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
      {createBudgetModalOpen === true && (
        <CreateBudgetModal
          open={true}
          onCancel={() => setCreateBudgetModalOpen(false)}
          onSuccess={(budget: Model.Budget) => {
            setCreateBudgetModalOpen(false);
            dispatch(actions.addBudgetToStateAction(budget));
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
      <CreateTemplateModal
        open={createTemplateModalOpen}
        onCancel={() => setCreateTempateModalOpen(false)}
        onSuccess={(template: Model.Template) => {
          setCreateTempateModalOpen(false);
          dispatch(actions.addTemplateToStateAction(template));
          history.push(`/templates/${template.id}/accounts`);
        }}
      />
      <IsStaff>
        <CreateTemplateModal
          open={createCommunityTemplateModalOpen}
          community={true}
          onCancel={() => setCreateCommunityTempateModalOpen(false)}
          onSuccess={(template: Model.Template) => {
            setCreateCommunityTempateModalOpen(false);
            dispatch(actions.addCommunityTemplateToStateAction(template));
            history.push(`/templates/${template.id}/accounts`);
          }}
        />
      </IsStaff>
    </React.Fragment>
  );
};

export default Templates;
