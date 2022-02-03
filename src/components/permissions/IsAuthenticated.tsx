import { ReactNode } from "react";
import { ShowHide } from "components";
import { users } from "lib";

type IsAuthenticatedProps = {
  children: ReactNode;
};

const IsAuthenticated: React.FC<IsAuthenticatedProps> = ({ children }) => {
  const user = users.hooks.useUser();
  return <ShowHide show={user !== null}>{children}</ShowHide>;
};

export default IsAuthenticated;
