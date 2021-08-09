import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/pro-light-svg-icons";

import { VerticalFlexCenter } from "components";
import { Button } from "components/buttons";
import { Input } from "components/fields";
import { HorizontalMenu } from "components/menus";
import { IHorizontalMenuItem } from "components/menus/HorizontalMenu";
import { CreateBudgetModal } from "components/modals";

import {
  addBudgetToStateAction,
  setTemplatesSearchAction,
  setCommunityTemplatesSearchAction
} from "../../store/actions";
import "./TemplatesMenu.scss";

type TemplatesPage = "my-templates" | "discover";

const selectTemplatesSearch = (state: Modules.ApplicationStore) => state.dashboard.templates.search;
const selectCommunityTemplatesSearch = (state: Modules.ApplicationStore) => state.dashboard.community.search;

const TemplatesMenu = (): JSX.Element => {
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
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
        <div style={{ flexGrow: 100 }}>
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
        </div>
        <div className={"extra-wrapper"}>
          <VerticalFlexCenter>
            <Input
              placeholder={"Search Templates..."}
              value={page === "my-templates" ? templatesSearch : communitySearch}
              allowClear={true}
              prefix={<FontAwesomeIcon className={"icon"} icon={faSearch} />}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                if (page === "my-templates") {
                  dispatch(setTemplatesSearchAction(event.target.value));
                } else {
                  dispatch(setCommunityTemplatesSearchAction(event.target.value));
                }
              }}
            />
          </VerticalFlexCenter>
          <VerticalFlexCenter>
            <Button
              loading={false}
              className={"btn btn--primary"}
              style={{ width: "100%" }}
              onClick={() => setCreateBudgetModalOpen(true)}
            >
              {"Blank Budget"}
            </Button>
          </VerticalFlexCenter>
        </div>
      </div>
      {createBudgetModalOpen === true && (
        <CreateBudgetModal
          open={true}
          onCancel={() => setCreateBudgetModalOpen(false)}
          onSuccess={(budget: Model.Budget) => {
            setCreateBudgetModalOpen(false);
            dispatch(addBudgetToStateAction(budget));
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default TemplatesMenu;
