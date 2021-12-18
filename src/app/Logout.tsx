import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import * as api from "api";
import { notifications } from "lib";

export const Logout = (): JSX.Element => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    api
      .logout()
      .then(() => setRedirect(true))
      .catch(e => notifications.requestError(e));
  }, []);

  if (redirect === true) {
    return <Redirect to={"/login"} />;
  }
  return <></>;
};

export default Logout;
