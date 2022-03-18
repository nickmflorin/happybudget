import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";

import * as api from "api";
import { notifications } from "lib";
import * as store from "store";

export const Logout = (): JSX.Element => {
  const [redirect, setRedirect] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    api
      .logout()
      .then(() => dispatch(store.actions.clearLoggedInUserAction(null)))
      .catch(e => notifications.requestError(e))
      .finally(() => setRedirect(true));
  }, []);

  if (redirect === true) {
    return <Redirect to={"/login"} />;
  }
  return <></>;
};

export default React.memo(Logout);
