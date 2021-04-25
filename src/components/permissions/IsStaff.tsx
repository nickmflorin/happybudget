import { ReactNode } from "react";
import { ShowHide } from "components";
import { useLoggedInUser } from "store/hooks";

interface IsStaffProps {
  children: ReactNode;
}

const IsStaff: React.FC<IsStaffProps> = ({ children }) => {
  const user = useLoggedInUser();
  return <ShowHide show={user.is_staff === true}>{children}</ShowHide>;
};

export default IsStaff;
