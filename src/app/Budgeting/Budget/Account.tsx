import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil } from "lodash";

import { tabling, budgeting } from "lib";
import { connectTableToAuthenticatedStore, SubAccountsTable as GenericSubAccountsTable } from "tabling";

import { BudgetPage } from "../Pages";
import { useFringesModalControl } from "../hooks";
import { actions, selectors, sagas } from "../store";
import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;
type TC = SubAccountsTableActionContext<Model.Budget, Model.Account, false>;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericSubAccountsTable.AuthenticatedBudgetProps<Model.Account>,
  R,
  M,
  TC,
  Tables.SubAccountTableStore
>({
  actions: {
    handleEvent: actions.budget.account.handleTableEventAction,
    loading: actions.budget.account.loadingAction,
    response: actions.budget.account.responseAction,
    setSearch: actions.budget.account.setSearchAction
  },
  tableId: (c: TC) => `${c.domain}-${c.parentType}-accounts`,
  selector: (c: TC) => selectors.createSubAccountsTableStoreSelector(c),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.budget.account.createTableSaga(table),
  footerRowSelectors: (c: TC) => ({
    page: selectors.createBudgetFooterSelector(c),
    footer: selectors.createAccountFooterSelector({ ...c, id: c.parentId })
  })
})(GenericSubAccountsTable.AuthenticatedBudget);

interface AccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const Account = ({ setPreviewModalVisible, ...props }: AccountProps): JSX.Element => {
  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const [fringesModalVisible, openFringesModal, closeFringesModal] = useFringesModalControl<
    Model.Budget,
    Model.Account
  >({
    parentId: props.id,
    budgetId: props.budgetId,
    domain: "budget",
    parentType: "account",
    public: false,
    table: table.current,
    fringesTableEventAction: actions.budget.handleFringesTableEventAction,
    tableEventAction: actions.budget.account.handleTableEventAction
  });

  const account = useSelector((s: Application.Store) =>
    selectors.selectAccountDetail(s, { id: props.id, domain: "budget", public: false })
  );

  useEffect(() => {
    dispatch(
      actions.budget.account.requestAccountAction(null, {
        id: props.id,
        domain: "budget",
        public: false,
        budgetId: props.budgetId
      })
    );
  }, [props.id, props.budgetId]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(account)) {
      budgeting.urls.setLastVisited(props.budget, account);
    }
  }, [props.budget, account]);

  useEffect(() => {
    dispatch(
      actions.budget.account.requestAction(null, {
        parentId: props.id,
        budgetId: props.budgetId,
        parentType: "account",
        domain: "budget",
        public: false
      })
    );
  }, [props.id, props.budgetId]);

  return (
    <BudgetPage budget={props.budget} parent={account}>
      <ConnectedTable
        {...props}
        parent={account}
        tableContext={{
          parentId: props.id,
          budgetId: props.budgetId,
          parentType: "account",
          domain: "budget",
          public: false
        }}
        onExportPdf={() => setPreviewModalVisible(true)}
        onViewFringes={openFringesModal}
        table={table}
        onShared={(publicToken: Model.PublicToken) =>
          dispatch(
            actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: publicToken } }, {})
          )
        }
        onShareUpdated={(publicToken: Model.PublicToken) =>
          dispatch(
            actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: publicToken } }, {})
          )
        }
        onUnshared={() =>
          dispatch(actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: null } }, {}))
        }
      />
      <FringesModal
        {...props}
        table={fringesTable}
        open={fringesModalVisible}
        parentType={"account"}
        onCancel={() => closeFringesModal()}
      />
    </BudgetPage>
  );
};

export default Account;
