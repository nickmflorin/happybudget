import React from "react";
import { Dropdown, Icon } from "components";

import { useLoggedInUser } from "store/hooks";

interface TemplateDropdownProps {
  readonly children: JSX.Element;
  readonly onCreateBudget: () => void;
  readonly onCreateTemplate: () => void;
  readonly onCreateCommunityTemplate: () => void;
  readonly page: string | undefined;
}

const TemplateDropdown: React.FC<TemplateDropdownProps> = ({
  children,
  onCreateBudget,
  onCreateTemplate,
  onCreateCommunityTemplate,
  page
}): JSX.Element => {
  const user = useLoggedInUser();

  return (
    <Dropdown
      menuItems={[
        {
          id: "create-new-budget",
          label: "Create New Budget",
          icon: <Icon icon={"pencil"} weight={"light"} />,
          onClick: () => onCreateBudget()
        },
        {
          id: "create-new-template",
          label: "Create New Template",
          icon: <Icon icon={"pencil"} weight={"light"} />,
          onClick: () => onCreateTemplate(),
          visible: page === "my-templates"
        },
        {
          id: "create-new-community-template",
          label: "Create New Community Template",
          icon: <Icon icon={"pencil"} weight={"light"} />,
          onClick: () => onCreateCommunityTemplate(),
          visible: page === "discover" && user.is_staff === true
        }
      ]}
      placement={"bottomLeft"}
    >
      {children}
    </Dropdown>
  );
};

export default TemplateDropdown;
