import { ReactNode } from "react";

import { hooks } from "store";
import { ShowHide } from "components";

type IsAuthenticatedProps = {
  children: ReactNode;
};

const IsAuthenticated: React.FC<IsAuthenticatedProps> = ({ children }) => {
  const user = hooks.useUser();
  return <ShowHide show={user !== null}>{children}</ShowHide>;
};

export default IsAuthenticated;
