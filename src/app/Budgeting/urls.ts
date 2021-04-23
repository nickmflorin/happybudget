import { isNil } from "lodash";

export const getUrl = (
  budget: Model.Budget | Model.Template,
  entity?: Model.SimpleAccount | Model.SimpleSubAccount
): string => {
  const designation = budget.type;
  if (isNil(entity)) {
    return `/${designation}s/${budget.id}/accounts`;
  }
  /* eslint-disable indent */
  return entity.type === "subaccount"
    ? `/${designation}s/${budget.id}/subaccounts/${entity.id}`
    : entity.type === "account"
    ? `/${designation}s/${budget.id}/accounts/${entity.id}`
    : `/${designation}s/${budget.id}/accounts`;
};
