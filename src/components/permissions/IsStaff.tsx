import { ReactNode } from "react";
import { ShowHide } from "components";
import * as store from "store";

type IsStaffProps = {
  children: ReactNode;
};

const IsStaff: React.FC<IsStaffProps> = ({ children }) => {
  const user = store.hooks.useLoggedInUser();
  return <ShowHide show={user.is_staff === true}>{children}</ShowHide>;
};

export default IsStaff;
