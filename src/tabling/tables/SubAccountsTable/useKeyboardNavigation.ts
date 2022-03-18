import { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { isNil, findIndex } from "lodash";

import { budgeting, http } from "lib";

export type UseKeyboardNavigationProps<B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount> = {
  readonly id: P["id"];
  readonly budgetId: B["id"];
  readonly domain: B["domain"];
  readonly parent: P | null;
  readonly parentType: P["type"];
  readonly tokenId?: string;
};

export type UseKeyboardNavigationReturnType<R extends Tables.BudgetRowData> = {
  readonly onBack: () => void;
  readonly onLeft: () => void;
  readonly onRight: () => void;
  readonly onRowExpand: undefined | ((row: Table.ModelRow<R>) => void);
};

const useKeyboardNavigation = <
  B extends Model.BaseBudget,
  P extends Model.Account | Model.SubAccount,
  R extends Tables.BudgetRowData
>(
  props: UseKeyboardNavigationProps<B, P>
): UseKeyboardNavigationReturnType<R> => {
  const history = useHistory();

  const onBack = useMemo(
    () => () => {
      if (!isNil(props.parent) && !isNil(props.parent.ancestors) && props.parent.ancestors.length !== 0) {
        const ancestor = props.parent.ancestors[props.parent.ancestors.length - 1] as
          | Model.SimpleBudget
          | Model.SimpleAccount
          | Model.SimpleSubAccount;
        if (ancestor.type === "budget") {
          history.push(
            http.addQueryParamsToUrl(
              budgeting.urls.getUrl({ domain: props.domain, id: props.budgetId }, undefined, props.tokenId),
              { row: props.id }
            )
          );
        } else {
          history.push(
            http.addQueryParamsToUrl(
              budgeting.urls.getUrl(
                { domain: props.domain, id: props.budgetId },
                { type: ancestor.type, id: ancestor.id },
                props.tokenId
              ),
              { row: props.id }
            )
          );
        }
      }
    },
    [props.parent, props.budgetId, props.tokenId, props.domain, props.id]
  );

  const onRowExpand = useMemo(
    () =>
      props.parentType === "account"
        ? (row: Table.ModelRow<R>) =>
            history.push(
              budgeting.urls.getUrl(
                { domain: props.domain, id: props.budgetId },
                { type: "subaccount", id: row.id },
                props.tokenId
              )
            )
        : undefined,
    [props.domain, props.budgetId, props.parentType, props.tokenId]
  );

  const onLeft = useMemo(
    () => () => {
      const parent = props.parent;
      if (!isNil(parent) && !isNil(parent.table)) {
        const index = findIndex<typeof parent.table[number]>(
          parent.table || [],
          (sib: typeof parent.table[number]) => sib.id === parent.id
        );
        if (index !== -1 && parent.table[index - 1] !== undefined) {
          history.push(
            budgeting.urls.getUrl(
              { id: props.budgetId, domain: props.domain },
              { type: props.parentType, id: parent.table[index - 1].id }
            )
          );
        }
      }
    },
    [props.parent, props.domain, props.budgetId, props.parentType, props.tokenId]
  );

  const onRight = useMemo(
    () => () => {
      const parent = props.parent;
      if (!isNil(parent) && !isNil(parent.table)) {
        const index = findIndex<typeof parent.table[number]>(
          parent.table || [],
          (sib: typeof parent.table[number]) => sib.id === parent.id
        );
        if (index !== -1 && parent.table[index + 1] !== undefined) {
          history.push(
            budgeting.urls.getUrl(
              { id: props.budgetId, domain: props.domain },
              { type: props.parentType, id: parent.table[index + 1].id }
            )
          );
        }
      }
    },
    [props.budgetId, props.domain, props.parent, props.parentType, props.tokenId]
  );

  return { onBack, onLeft, onRight, onRowExpand };
};

export default useKeyboardNavigation;
