import { ReactNode } from "react";

import * as store from "store";
import { ShowHide } from "components";

type IsStaffProps = {
  children: ReactNode;
};

const IsStaff: React.FC<IsStaffProps> = ({ children }) => {
  const [user, _] = store.hooks.useLoggedInUser();
  return <ShowHide show={user.is_staff === true}>{children}</ShowHide>;
};

export default IsStaff;
