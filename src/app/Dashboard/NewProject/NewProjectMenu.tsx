import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "antd";

import { HorizontalMenu } from "components/menus";
import { CreateBudgetModal, CreateTemplateModal } from "components/modals";

import { addBudgetToStateAction, addTemplateToStateAction } from "../actions";
import "./NewProjectMenu.scss";

type NewProjectPage = "my-templates" | "discover";

const NewProjectMenu = (): JSX.Element => {
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <div className={"new-project-menu"}>
        <div style={{ flexGrow: 100 }}>
          <div className={"new-project-menu-menu-wrapper"}>
            <HorizontalMenu<NewProjectPage>
              className={"new-project-menu-menu"}
              itemProps={{ className: "new-project-menu-menu-item" }}
              items={[
                { id: "my-templates", label: "My Templates", onClick: () => history.push("/new/templates") },
                { id: "discover", label: "Discover", onClick: () => history.push("/new/discover") }
              ]}
            />
          </div>
        </div>
        <div className={"new-project-menu-button-wrapper"}>
          <Button
            loading={false}
            className={"btn--primary"}
            style={{ width: "100%" }}
            onClick={() => setCreateTempateModalOpen(true)}
          >
            {"New Template"}
          </Button>
        </div>
        <div className={"new-project-menu-button-wrapper"}>
          <Button
            loading={false}
            className={"btn--primary"}
            style={{ width: "100%" }}
            onClick={() => setCreateBudgetModalOpen(true)}
          >
            {"Custom Budget"}
          </Button>
        </div>
      </div>
      <CreateBudgetModal
        open={createBudgetModalOpen}
        onCancel={() => setCreateBudgetModalOpen(false)}
        onSuccess={(budget: Model.Budget) => {
          setCreateBudgetModalOpen(false);
          dispatch(addBudgetToStateAction(budget));
          history.push(`/budgets/${budget.id}/accounts`);
        }}
      />
      <CreateTemplateModal
        open={createTemplateModalOpen}
        onCancel={() => setCreateTempateModalOpen(false)}
        onSuccess={(template: Model.Template) => {
          setCreateTempateModalOpen(false);
          dispatch(addTemplateToStateAction(template));
          history.push(`/templates/${template.id}/accounts`);
        }}
      />
    </React.Fragment>
  );
};

export default NewProjectMenu;
