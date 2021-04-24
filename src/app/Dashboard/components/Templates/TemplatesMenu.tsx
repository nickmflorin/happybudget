import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "antd";

import { HorizontalMenu } from "components/menus";
import { CreateBudgetModal } from "components/modals";

import { addBudgetToStateAction } from "../../store/actions";
import "./TemplatesMenu.scss";

type TemplatesPage = "my-templates" | "discover";

const TemplatesMenu = (): JSX.Element => {
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <div className={"templates-menu"}>
        <div style={{ flexGrow: 100 }}>
          <div className={"templates-menu-menu-wrapper"}>
            <HorizontalMenu<TemplatesPage>
              className={"templates-menu-menu"}
              itemProps={{ className: "templates-menu-menu-item" }}
              items={[
                { id: "my-templates", label: "My Templates", onClick: () => history.push("/templates") },
                { id: "discover", label: "Discover", onClick: () => history.push("/discover") }
              ]}
            />
          </div>
        </div>
        <div className={"templates-menu-button-wrapper"}>
          <Button
            loading={false}
            className={"btn--primary"}
            style={{ width: "100%" }}
            onClick={() => setCreateBudgetModalOpen(true)}
          >
            {"Blank Budget"}
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
    </React.Fragment>
  );
};

export default TemplatesMenu;
