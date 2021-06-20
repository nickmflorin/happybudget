import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagic, faCloud, faCog } from "@fortawesome/pro-solid-svg-icons";
import { faCopy, faFileSpreadsheet } from "@fortawesome/pro-light-svg-icons";

import { RenderIfValidId } from "components";

import { wipeStateAction, setTemplateIdAction } from "../../store/actions/template";
import { GenericLayout } from "../Generic";
import { getTemplateLastVisited } from "../../urls";

import Account from "./Account";
import Accounts from "./Accounts";
import SubAccount from "./SubAccount";

const Template = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { templateId } = useParams<{ templateId: string }>();
  const match = useRouteMatch();

  // const instance = useSelector(selectTemplateInstance);
  // const template = useSelector(selectTemplateDetail);

  useEffect(() => {
    dispatch(wipeStateAction(null));
    if (!isNaN(parseInt(templateId))) {
      dispatch(setTemplateIdAction(parseInt(templateId)));
    }
  }, [templateId]);

  return (
    <GenericLayout
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
