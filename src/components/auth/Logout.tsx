import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { logout } from "services";

export function Logout(): null {
  const history = useHistory();

  useEffect(() => {
    logout()
      .then(() => {
        history.push("/login");
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
  }, [history]);

  return null;
}

export default Logout;
