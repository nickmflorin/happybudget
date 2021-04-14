import { useHistory } from "react-router-dom";

import { EditOutlined, DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { useLoggedInUser, useTimezone } from "store/hooks";
import { toAbbvDisplayDateTime } from "lib/util/dates";

import Card from "./Card";

interface BudgetCardProps {
  budget: Model.Budget;
  selected: boolean;
  loading: boolean;
  onDelete: (budget: Model.Budget) => void;
  onEdit: (budget: Model.Budget) => void;
  onSelect: (checked: boolean) => void;
}

const BudgetCard = ({ budget, loading, selected, onEdit, onDelete, onSelect }: BudgetCardProps): JSX.Element => {
  const history = useHistory();
  const user = useLoggedInUser();
  const tz = useTimezone();

  return (
    <Card
      onClick={() => history.push(`/budgets/${budget.id}`)}
      title={budget.name}
      subTitle={`Last edited by ${user.full_name} on ${toAbbvDisplayDateTime(budget.updated_at, { tz })}`}
      loading={loading}
      selected={selected}
      onSelect={onSelect}
      dropdown={[
        {
          text: "Edit",
          icon: <EditOutlined className={"icon"} />,
          onClick: () => onEdit(budget)
        },
        {
          text: "Delete",
          icon: <DeleteOutlined className={"icon"} />,
          onClick: () => onDelete(budget)
        },
        {
          text: "Download",
          icon: <DownloadOutlined className={"icon"} />,
          /* eslint-disable no-console */
          onClick: () => console.log("Not implemented yet."),
          loading: false
        }
      ]}
    />
  );
};

export default BudgetCard;
