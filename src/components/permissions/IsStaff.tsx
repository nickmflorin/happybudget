import { ReactNode } from "react";
import { ShowHide } from "components";
import { users } from "lib";

interface IsStaffProps {
  children: ReactNode;
}

const IsStaff: React.FC<IsStaffProps> = ({ children }) => {
  const user = users.hooks.useLoggedInUser();
  return <ShowHide show={user.is_staff === true}>{children}</ShowHide>;
};

export default IsStaff;
