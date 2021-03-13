import React, { ReactNode } from "react";

interface IconTableCellProps {
  icon: JSX.Element;
  children: ReactNode | string;
}

const IconTableCell = ({ icon, children }: IconTableCellProps): JSX.Element => {
  return (
    <div className={"icon-cell-container"}>
      <div className={"icon-container"}>{icon}</div>
      <div className={"text-container"}>{children}</div>
    </div>
  );
};

export default IconTableCell;
