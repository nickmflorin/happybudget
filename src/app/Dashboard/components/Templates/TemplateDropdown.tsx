import React from "react";

import { useLoggedInUser } from "store/hooks";

import { Icon } from "components";
import { DropdownMenu } from "components/dropdowns";

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
    <DropdownMenu
      models={[
        {
          id: "create-new-budget",
          label: "New Blank Budget",
          icon: <Icon icon={"pencil"} weight={"light"} />,
          onClick: () => onCreateBudget()
        },
        {
          id: "create-new-template",
          label: "New Template",
          icon: <Icon icon={"pencil"} weight={"light"} />,
          onClick: () => onCreateTemplate(),
          visible: page === "my-templates"
        },
        {
          id: "create-new-community-template",
          label: "New Community Template",
          icon: <Icon icon={"pencil"} weight={"light"} />,
          onClick: () => onCreateCommunityTemplate(),
          visible: page === "discover" && user.is_staff === true
        }
      ]}
      placement={"bottomLeft"}
    >
      {children}
    </DropdownMenu>
  );
};

export default TemplateDropdown;
