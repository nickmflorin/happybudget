import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { isNil } from "lodash";

import { budgeting } from "lib";
import { RenderIfValidId, Icon } from "components";
import { Layout } from "components/layout";

import { Account, Accounts, SubAccount } from "./components";
import { actions, selectors } from "./store";

const Template = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { templateId } = useParams<{ templateId: string }>();
  const match = useRouteMatch();
  const template = useSelector(selectors.selectTemplateDetail);

  useEffect(() => {
    if (!isNaN(parseInt(templateId))) {
      dispatch(actions.setTemplateIdAction(parseInt(templateId)));
    }
  }, [templateId]);

  return (
    <Layout
      collapsed
      className={"layout--budget"}
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
              const templateLastVisited = budgeting.urls.getLastVisited("template-last-visited", parseInt(templateId));
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
    </Layout>
  );
};

export default Template;
