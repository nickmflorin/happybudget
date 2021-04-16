import { useHistory } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/pro-solid-svg-icons";

import { useLoggedInUser, useTimezone } from "store/hooks";
import { toAbbvDisplayDateTime } from "lib/util/dates";

import Card from "../../Card";

interface TemplateCardProps {
  template: Model.Template;
  selected: boolean;
  loading: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: (checked: boolean) => void;
  onDerive: () => void;
}

const TemplateCard = ({
  template,
  loading,
  selected,
  onDerive,
  onEdit,
  onDelete,
  onSelect
}: TemplateCardProps): JSX.Element => {
  const history = useHistory();
  const user = useLoggedInUser();
  const tz = useTimezone();

  return (
    <Card
      className={"template-card"}
      onClick={() => history.push(`/templates/${template.id}`)}
      title={template.name}
      subTitle={`Last edited by ${user.full_name} on ${toAbbvDisplayDateTime(template.updated_at, { tz })}`}
      loading={loading}
      selected={selected}
      onSelect={onSelect}
      dropdown={[
        {
          text: "Create Budget",
          icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />,
          onClick: () => onDerive()
        },
        {
          text: "Edit",
          icon: <FontAwesomeIcon className={"icon"} icon={faEdit} />,
          onClick: () => onEdit()
        },
        {
          text: "Delete",
          icon: <FontAwesomeIcon className={"icon"} icon={faTrash} />,
          onClick: () => onDelete()
        }
      ]}
    />
  );
};

export default TemplateCard;
