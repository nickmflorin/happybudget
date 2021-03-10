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
        // TODO: This is an edge case (or at least should be) - we want to
        // be aware of the error but not take any action.  We might want to
        // display it in the UI - although this should NOT fail.
        // TODO: Should we remove local session data anyways?  It could cause
        // a mismatch between backend/frontend.
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
