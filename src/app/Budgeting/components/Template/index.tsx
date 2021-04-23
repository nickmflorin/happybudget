import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import Cookies from "universal-cookie";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagic, faCloud, faCog } from "@fortawesome/pro-solid-svg-icons";
import { faCopy, faPercentage, faFileSpreadsheet } from "@fortawesome/pro-light-svg-icons";

import { RenderIfValidId } from "components";
import { AncestorsBreadCrumbs } from "components/layout";
import { componentLoader } from "lib/operational";

import { setTemplateIdAction } from "../../store/actions/template";
import { selectTemplateInstance, selectTemplateDetail } from "../../store/selectors";

import Generic from "../Generic";

const Account = React.lazy(() => componentLoader(() => import("./Account")));
const Accounts = React.lazy(() => componentLoader(() => import("./Accounts")));
const SubAccount = React.lazy(() => componentLoader(() => import("./SubAccount")));
const Fringes = React.lazy(() => componentLoader(() => import("./Fringes")));

const Template = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { templateId } = useParams<{ templateId: string }>();
  const match = useRouteMatch();

  const instance = useSelector(selectTemplateInstance);
  const template = useSelector(selectTemplateDetail);

  useEffect(() => {
    if (!isNaN(parseInt(templateId))) {
      dispatch(setTemplateIdAction(parseInt(templateId)));
    }
  }, [templateId]);

  return (
    <Generic
      breadcrumbs={!isNil(template) ? <AncestorsBreadCrumbs instance={instance} budget={template} /> : <></>}
      toolbar={[
        {
          icon: <FontAwesomeIcon icon={faMagic} />,
          disabled: true
        },
        {
          icon: <FontAwesomeIcon icon={faCloud} />,
          disabled: true
        },
        {
          icon: <FontAwesomeIcon icon={faCog} />,
          disabled: true
        }
      ]}
      sidebar={[
        {
          icon: <FontAwesomeIcon icon={faCopy} />,
          onClick: () => history.push("/new/templates"),
          tooltip: {
            title: "My Templates",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faPercentage} />,
          onClick: () => history.push(`/templates/${templateId}/fringes`),
          active: location.pathname.startsWith(`/templates/${templateId}/fringes`),
          tooltip: {
            title: "Fringes",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faFileSpreadsheet} />,
          onClick: () => {
            const cookies = new Cookies();
            // TODO: Only do this if the templateId refers to the current templateId the view is
            // rendered for!
            const templateLastVisited = cookies.get("template-last-visited");
            if (!isNil(templateLastVisited)) {
              history.push(templateLastVisited);
            } else {
              history.push(`/templates/${templateId}`);
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
          <Route path={"/templates/:templateId/fringes"} component={Fringes} />
          <Route exact path={"/templates/:templateId/accounts/:accountId"} component={Account} />
          <Route path={"/templates/:templateId/accounts"} component={Accounts} />
          <Route path={"/templates/:templateId/subaccounts/:subaccountId"} component={SubAccount} />
        </Switch>
      </RenderIfValidId>
    </Generic>
  );
};

export default Template;
