import { WrapInStore } from "components/routes";

import PublicBudget from "./PublicBudget";

type PublicBudgetRootProps = {
  readonly budgetId: number;
  readonly tokenId: string;
};

const PublicBudgetRoot = (props: PublicBudgetRootProps): JSX.Element => (
  <WrapInStore
    isPublic={true}
    instanceType="budget"
    instanceId={props.budgetId}
    publicTokenId={props.tokenId}
  >
    <PublicBudget {...props} />
  </WrapInStore>
);

export default PublicBudgetRoot;
