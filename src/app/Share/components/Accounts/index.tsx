import { AccountsPage } from "app/Pages";
import AccountsTable from "./AccountsTable";

interface AccountsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const Accounts = ({ budget, budgetId }: AccountsProps): JSX.Element => {
  return (
    <AccountsPage budget={budget}>
      <AccountsTable budget={budget} budgetId={budgetId} />
    </AccountsPage>
  );
};

export default Accounts;
