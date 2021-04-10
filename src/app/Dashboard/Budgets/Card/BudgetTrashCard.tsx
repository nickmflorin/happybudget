import { RollbackOutlined, DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { useTimezone } from "store/hooks";
import { toAbbvDisplayDateTime } from "lib/util/dates";

import Card from "./Card";

interface BudgetTrashCardProps {
  budget: IBudget;
  onDelete: (budget: IBudget) => void;
  onRestore: (budget: IBudget) => void;
}

const BudgetTrashCard = ({ budget, onRestore, onDelete }: BudgetTrashCardProps): JSX.Element => {
  const tz = useTimezone();

  return (
    <Card
      title={budget.name}
      subTitle={`Deleted by No Name on ${toAbbvDisplayDateTime(budget.updated_at, { tz })}`}
      dropdown={[
        {
          text: "Edit",
          icon: <RollbackOutlined className={"icon"} />,
          onClick: () => onRestore(budget)
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

export default BudgetTrashCard;
