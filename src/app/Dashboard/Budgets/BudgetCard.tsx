import { useHistory } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/pro-solid-svg-icons";

import { useLoggedInUser, useTimezone } from "store/hooks";
import { toAbbvDisplayDateTime } from "lib/util/dates";

import Card from "../Card";

interface BudgetCardProps {
  budget: Model.Budget;
  loading: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

const BudgetCard = ({ budget, loading, onEdit, onDelete }: BudgetCardProps): JSX.Element => {
  const history = useHistory();
  const user = useLoggedInUser();
  const tz = useTimezone();

  return (
    <Card
      className={"budget-card"}
      onClick={() => history.push(`/budgets/${budget.id}`)}
      title={budget.name}
      subTitle={`Last edited by ${user.full_name} on ${toAbbvDisplayDateTime(budget.updated_at, { tz })}`}
      loading={loading}
      image={budget.image}
      dropdown={[
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

export default BudgetCard;
