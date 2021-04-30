import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faImage } from "@fortawesome/pro-light-svg-icons";

import { useLoggedInUser, useTimezone } from "store/hooks";
import { toAbbvDisplayDateTime } from "lib/util/dates";

import Card from "./Card";

interface BudgetCardProps {
  budget: Model.Budget;
  loading?: boolean;
  deleting: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onClick: () => void;
}

const BudgetCard = ({ budget, loading, deleting, onEdit, onDelete, onClick }: BudgetCardProps): JSX.Element => {
  const user = useLoggedInUser();
  const tz = useTimezone();

  return (
    <Card
      className={"budget-card"}
      onClick={() => onClick()}
      title={budget.name}
      subTitle={`Last edited by ${user.full_name} on ${toAbbvDisplayDateTime(budget.updated_at, { tz })}`}
      loading={loading}
      image={budget.image}
      dropdown={[
        {
          id: "edit",
          text: "Edit Name/Image",
          icon: <FontAwesomeIcon className={"icon"} icon={faImage} />,
          onClick: () => onEdit()
        },
        {
          id: "delete",
          text: "Delete",
          icon: <FontAwesomeIcon className={"icon"} icon={faTrash} />,
          onClick: () => onDelete(),
          loading: deleting
        }
      ]}
    />
  );
};

export default BudgetCard;
