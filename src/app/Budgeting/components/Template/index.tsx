import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { isNil, filter, map } from "lodash";
import { createSelector } from "reselect";

import { budgeting } from "lib";
import { RenderIfValidId, SavingChanges, Icon } from "components";

import { selectTemplateDetail } from "../../store/selectors";
import { wipeStateAction, setTemplateIdAction } from "../../store/actions/template";
import GenericLayout from "../GenericLayout";
import Account from "./Account";
import Accounts from "./Accounts";
import SubAccount from "./SubAccount";

const selectSaving = createSelector(
  (state: Modules.ApplicationStore) => state.budget.template.subaccount.table.deleting,
  (state: Modules.ApplicationStore) => state.budget.template.subaccount.table.updating,
  (state: Modules.ApplicationStore) => state.budget.template.subaccount.table.creating,
  (state: Modules.ApplicationStore) => state.budget.template.account.table.deleting,
  (state: Modules.ApplicationStore) => state.budget.template.account.table.updating,
  (state: Modules.ApplicationStore) => state.budget.template.account.table.creating,
  (state: Modules.ApplicationStore) => state.budget.template.budget.table.deleting,
  (state: Modules.ApplicationStore) => state.budget.template.budget.table.updating,
  (state: Modules.ApplicationStore) => state.budget.template.budget.table.creating,
  (...args: (Redux.ModelListActionInstance[] | boolean)[]) => {
    return (
      filter(
        map(args, (arg: Redux.ModelListActionInstance[] | boolean) =>
          Array.isArray(arg) ? arg.length !== 0 : arg === true
        ),
        (value: boolean) => value === true
      ).length !== 0
    );
  }
);

const Template = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { templateId } = useParams<{ templateId: string }>();
  const match = useRouteMatch();
  const saving = useSelector(selectSaving);
  const template = useSelector(selectTemplateDetail);

  useEffect(() => {
    dispatch(wipeStateAction(null));
    if (!isNaN(parseInt(templateId))) {
      dispatch(setTemplateIdAction(parseInt(templateId)));
    }
  }, [templateId]);

  return (
    <GenericLayout
      toolbar={() => <SavingChanges saving={saving} />}
      sidebar={[
        {
          icon: <Icon icon={"copy"} weight={"light"} />,
          activeIcon: <Icon icon={"copy"} weight={"solid"} />,
          onClick: () => history.push("/templates"),
          tooltip: {
            title: "My Templates",
            placement: "right"
          }
        },
        {
          icon: <Icon icon={"file-spreadsheet"} weight={"light"} />,
          activeIcon: <Icon icon={"file-spreadsheet"} weight={"solid"} />,
          onClick: () => {
            if (!isNaN(parseInt(templateId))) {
              const templateLastVisited = budgeting.urls.getTemplateLastVisited(parseInt(templateId));
              if (!isNil(templateLastVisited)) {
                history.push(templateLastVisited);
              } else {
                history.push(`/templates/${templateId}`);
              }
            }
          },
          active:
            location.pathname.startsWith("/templates") &&
            !location.pathname.startsWith(`/templates/${templateId}/fringes`),
          tooltip: {
            title: "Template",
            placement: "right"
          }
        }
      ]}
    >
      <RenderIfValidId id={[templateId]}>
        <Switch>
          <Redirect exact from={match.url} to={`${match.url}/accounts`} />
          <Route
            exact
            path={"/templates/:templateId/accounts/:accountId"}
            render={() => <Account templateId={parseInt(templateId)} template={template} />}
          />
          <Route
            path={"/templates/:templateId/accounts"}
            render={() => <Accounts templateId={parseInt(templateId)} template={template} />}
          />
          <Route
            path={"/templates/:templateId/subaccounts/:subaccountId"}
            render={() => <SubAccount templateId={parseInt(templateId)} template={template} />}
          />
        </Switch>
      </RenderIfValidId>
    </GenericLayout>
  );
};

export default Template;
