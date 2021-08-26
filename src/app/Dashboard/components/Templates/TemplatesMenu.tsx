import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Icon } from "components";
import { Button, CircleIconButton } from "components/buttons";
import { SearchInput } from "components/fields";
import { HorizontalMenu } from "components/menus";
import { IHorizontalMenuItem } from "components/menus/HorizontalMenu";
import { CreateBudgetModal, CreateTemplateModal } from "components/modals";
import { IsStaff } from "components/permissions";

import { actions } from "../../store";
import "./TemplatesMenu.scss";

type TemplatesPage = "my-templates" | "discover";

const selectTemplatesSearch = (state: Modules.ApplicationStore) => state.dashboard.templates.search;
const selectCommunityTemplatesSearch = (state: Modules.ApplicationStore) => state.dashboard.community.search;

const TemplatesMenu = (): JSX.Element => {
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);
  const [createCommunityTemplateModalOpen, setCreateCommunityTempateModalOpen] = useState(false);
  const [page, setPage] = useState<TemplatesPage | undefined>(undefined);

  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

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
      <div className={"templates-menu"}>
        <div className={"templates-menu-menu-wrapper"}>
          <HorizontalMenu<TemplatesPage>
            className={"templates-menu-menu"}
            itemProps={{ className: "templates-menu-menu-item" }}
            selected={page}
            onChange={(item: IHorizontalMenuItem<TemplatesPage>) => setPage(item.id)}
            items={[
              { id: "my-templates", label: "My Templates", onClick: () => history.push("/templates") },
              { id: "discover", label: "Discover", onClick: () => history.push("/discover") }
            ]}
          />
        </div>
        <div className={"template-sub-title"}>
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
      </div>

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

export default TemplatesMenu;
