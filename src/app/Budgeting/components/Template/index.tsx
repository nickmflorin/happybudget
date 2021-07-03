import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { isNil, filter, map } from "lodash";
import { createSelector } from "reselect";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faFileSpreadsheet } from "@fortawesome/pro-light-svg-icons";

import { RenderIfValidId, SavingChanges } from "components";

import { wipeStateAction, setTemplateIdAction } from "../../store/actions/template";
import { GenericLayout } from "../Generic";
import { getTemplateLastVisited } from "../../urls";

import Account from "./Account";
import Accounts from "./Accounts";
import SubAccount from "./SubAccount";

const selectSaving = createSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.updating,
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.creating,
  (state: Modules.ApplicationStore) => state.budgeting.template.account.subaccounts.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.template.account.subaccounts.updating,
  (state: Modules.ApplicationStore) => state.budgeting.template.account.subaccounts.creating,
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.updating,
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.creating,
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
          icon: <FontAwesomeIcon icon={faCopy} />,
          onClick: () => history.push("/templates"),
          tooltip: {
            title: "My Templates",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faFileSpreadsheet} />,
          onClick: () => {
            if (!isNaN(parseInt(templateId))) {
              const templateLastVisited = getTemplateLastVisited(parseInt(templateId));
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
          <Route exact path={"/templates/:templateId/accounts/:accountId"} component={Account} />
          <Route path={"/templates/:templateId/accounts"} component={Accounts} />
          <Route path={"/templates/:templateId/subaccounts/:subaccountId"} component={SubAccount} />
        </Switch>
      </RenderIfValidId>
    </GenericLayout>
  );
};

export default Template;
