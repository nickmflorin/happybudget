import { ReactNode } from "react";
import { ShowHide } from "components";
import { hooks } from "store";

type IsAuthenticatedProps = {
  children: ReactNode;
};

const IsAuthenticated: React.FC<IsAuthenticatedProps> = ({ children }) => {
  const user = hooks.useUser();
  return <ShowHide show={user !== null}>{children}</ShowHide>;
};

export default IsAuthenticated;
