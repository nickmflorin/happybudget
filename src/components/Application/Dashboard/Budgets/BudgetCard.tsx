import { useHistory } from "react-router-dom";

import { useLoggedInUser, useTimezone } from "store/hooks";
import { toAbbvDisplayDateTime } from "util/dates";
import { selectRandom } from "util/arrays";

import { Icons, Colors } from "./constants";

interface BudgetCardProps {
  budget: IBudget;
}

const BudgetCard = ({ budget }: BudgetCardProps): JSX.Element => {
  const history = useHistory();
  const user = useLoggedInUser();
  const tz = useTimezone();
  const Icon = selectRandom(Icons);
  return (
    <div className={"budget-card"} onClick={() => history.push(`/budgets/${budget.id}`)}>
      <div className={"budget-card-icon-wrapper"} style={{ backgroundColor: selectRandom(Colors) }}>
        <Icon />
      </div>
      <div className={"budget-card-footer"}>
        <div className={"budget-name"}>{budget.name}</div>
        <div className={"last-edited-by"}>{`Last edited by ${
          user.full_name
        } on ${toAbbvDisplayDateTime(budget.updated_at, { tz })}`}</div>
      </div>
    </div>
  );
};

export default BudgetCard;
