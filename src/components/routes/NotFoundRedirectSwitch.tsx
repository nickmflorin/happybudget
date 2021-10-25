import { useSelector } from "react-redux";
import { Switch } from "react-router-dom";

import NotFoundPage from "./NotFoundPage";

const selectRedirect = (state: Application.Authenticated.Store | Application.Unauthenticated.Store) =>
  state.redirect404;

interface NotFoundRedirectSwitchProps {
  readonly children: JSX.Element | JSX.Element[];
}

const NotFoundRedirectSwitch = (props: NotFoundRedirectSwitchProps) => {
  const redirect = useSelector(selectRedirect);
  if (redirect !== null) {
    return <NotFoundPage redirect={redirect} />;
  } else {
    return <Switch>{props.children}</Switch>;
  }
};

export default NotFoundRedirectSwitch;
