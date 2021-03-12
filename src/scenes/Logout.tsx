import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { logout } from "services";

export const Logout = (): JSX.Element => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    logout()
      .then(() => {
        setRedirect(true);
      })
      .catch(e => {
        /* eslint-disable no-console */
        console.error(`There was an error logging out: \n ${e}`);
      });
  }, []);

  if (redirect === true) {
    return <Redirect to={"/login"} />;
  }
  return <></>;
};

export default Logout;
