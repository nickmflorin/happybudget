import { useMemo } from "react";

import { isNil, findIndex } from "lodash";
import { useHistory } from "react-router-dom";

import { budgeting, http } from "lib";
import { useConfirmation } from "components/notifications/hooks";

export type UseKeyboardNavigationProps<
  B extends Model.BaseBudget,
  P extends Model.Account | Model.SubAccount,
  PUBLIC extends boolean = false,
> = {
  readonly parent: P | null;
  readonly tokenId?: string;
  readonly tableContext: SubAccountsTableActionContext<B, P, PUBLIC>;
};

export type UseKeyboardNavigationReturnType<R extends Tables.SubAccountRowData> = {
  readonly onBack: () => void;
  readonly onLeft: () => void;
  readonly onRight: () => void;
  readonly onRowExpand: undefined | ((row: Table.ModelRow<R>) => void);
  readonly confirmExpandModal: JSX.Element;
};

const rowShouldWarn = <R extends Tables.SubAccountRowData>(row: Table.ModelRow<R>) =>
  row.children.length === 0 &&
  (!isNil(row.data.contact) ||
    row.data.fringes.length !== 0 ||
    (!isNil(row.data.attachments) && row.data.attachments.length !== 0) ||
    !isNil(row.data.multiplier) ||
    !isNil(row.data.quantity) ||
    !isNil(row.data.rate) ||
    !isNil(row.data.unit));

const useKeyboardNavigation = <
  B extends Model.BaseBudget,
  P extends Model.Account | Model.SubAccount,
  R extends Tables.SubAccountRowData,
  PUBLIC extends boolean = false,
>(
  props: UseKeyboardNavigationProps<B, P, PUBLIC>,
): UseKeyboardNavigationReturnType<R> => {
  const history = useHistory();

  const [confirmExpandModal, confirmRowExpand] = useConfirmation<[Table.ModelRow<R>]>({
    suppressionKey: "subaccount-row-expand-confirmation-suppressed",
    detail:
      "This will hide the values for several columns, but do not worry - the data will not be erased.",
    title: "Expand Row",
    onConfirmed: (row: Table.ModelRow<R>) =>
      history.push(
        budgeting.urls.getUrl(
          { domain: props.tableContext.domain, id: props.tableContext.budgetId },
          { type: "subaccount", id: row.id },
          props.tokenId,
        ),
      ),
  });

  const onBack = useMemo(
    () => () => {
      if (
        !isNil(props.parent) &&
        !isNil(props.parent.ancestors) &&
        props.parent.ancestors.length !== 0
      ) {
        const ancestor = props.parent.ancestors[props.parent.ancestors.length - 1] as
          | Model.SimpleBudget
          | Model.SimpleAccount
          | Model.SimpleSubAccount;
        if (ancestor.type === "budget") {
          history.push(
            http.addQueryParamsToUrl(
              budgeting.urls.getUrl(
                { domain: props.tableContext.domain, id: props.tableContext.budgetId },
                undefined,
                props.tokenId,
              ),
              { row: props.tableContext.parentId },
            ),
          );
        } else {
          history.push(
            http.addQueryParamsToUrl(
              budgeting.urls.getUrl(
                { domain: props.tableContext.domain, id: props.tableContext.budgetId },
                { type: ancestor.type, id: ancestor.id },
                props.tokenId,
              ),
              { row: props.tableContext.parentId },
            ),
          );
        }
      }
    },
    [
      props.parent,
      props.tableContext.budgetId,
      props.tokenId,
      props.tableContext.domain,
      props.tableContext.parentId,
    ],
  );

  const onRowExpand = useMemo(
    () =>
      props.tableContext.parentType === "account"
        ? (row: Table.ModelRow<R>) =>
            props.tableContext.public === false && rowShouldWarn(row)
              ? confirmRowExpand([row], "You are about to expand the row.")
              : history.push(
                  budgeting.urls.getUrl(
                    { domain: props.tableContext.domain, id: props.tableContext.budgetId },
                    { type: "subaccount", id: row.id },
                    props.tokenId,
                  ),
                )
        : undefined,
    [
      props.tableContext.domain,
      props.tableContext.budgetId,
      props.tableContext.parentType,
      props.tokenId,
    ],
  );

  const onLeft = useMemo(
    () => () => {
      const parent = props.parent;
      if (!isNil(parent) && !isNil(parent.table)) {
        const index = findIndex<typeof parent.table[number]>(
          parent.table || [],
          (sib: typeof parent.table[number]) => sib.id === parent.id,
        );
        if (index !== -1 && parent.table[index - 1] !== undefined) {
          history.push(
            budgeting.urls.getUrl(
              { id: props.tableContext.budgetId, domain: props.tableContext.domain },
              { type: props.tableContext.parentType, id: parent.table[index - 1].id },
            ),
          );
        }
      }
    },
    [
      props.parent,
      props.tableContext.domain,
      props.tableContext.budgetId,
      props.tableContext.parentType,
      props.tokenId,
    ],
  );

  const onRight = useMemo(
    () => () => {
      const parent = props.parent;
      if (!isNil(parent) && !isNil(parent.table)) {
        const index = findIndex<typeof parent.table[number]>(
          parent.table || [],
          (sib: typeof parent.table[number]) => sib.id === parent.id,
        );
        if (index !== -1 && parent.table[index + 1] !== undefined) {
          history.push(
            budgeting.urls.getUrl(
              { id: props.tableContext.budgetId, domain: props.tableContext.domain },
              { type: props.tableContext.parentType, id: parent.table[index + 1].id },
            ),
          );
        }
      }
    },
    [
      props.tableContext.budgetId,
      props.tableContext.domain,
      props.parent,
      props.tableContext.parentType,
      props.tokenId,
    ],
  );

  return { onBack, onLeft, onRight, onRowExpand, confirmExpandModal };
};

export default useKeyboardNavigation;
