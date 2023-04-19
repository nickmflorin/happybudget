import { useEffect } from "react";

import { isNil } from "lodash";
import { useDispatch, useSelector } from "react-redux";

import { tabling, budgeting } from "lib";
import {
  connectTableToAuthenticatedStore,
  SubAccountsTable as GenericSubAccountsTable,
} from "deprecated/components/tabling";

import { useFringesModalControl } from "../hooks";
import { BudgetPage } from "../Pages";
import { actions, selectors, sagas } from "../store";

import FringesModal from "./FringesModal";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;
type TC = SubAccountsTableContext<Model.Budget, Model.SubAccount, false>;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericSubAccountsTable.AuthenticatedBudgetProps<Model.SubAccount>,
  R,
  M,
  TC,
  Tables.SubAccountTableStore
>({
  actions: {
    handleEvent: actions.budget.subAccount.handleTableEventAction,
    loading: actions.budget.subAccount.loadingAction,
    response: actions.budget.subAccount.responseAction,
    setSearch: actions.budget.subAccount.setSearchAction,
  },
  tableId: (c: TC) => `${c.domain}-${c.parentType}-subaccounts`,
  selector: (c: TC) => selectors.createSubAccountsTableStoreSelector(c),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.budget.subAccount.createTableSaga(table),
  footerRowSelectors: (c: TC) => ({
    page: selectors.createBudgetFooterSelector(c),
    footer: selectors.createSubAccountFooterSelector({ ...c, id: c.parentId }),
  }),
})(GenericSubAccountsTable.AuthenticatedBudget);

interface SubAccountProps {
  readonly id: number;
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const SubAccount = ({ setPreviewModalVisible, ...props }: SubAccountProps): JSX.Element => {
  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  const [fringesModalVisible, openFringesModal, closeFringesModal] = useFringesModalControl<
    Model.Budget,
    Model.SubAccount
  >({
    parentId: props.id,
    budgetId: props.budgetId,
    domain: "budget",
    parentType: "subaccount",
    public: false,
    table: table.current,
    tableEventAction: actions.budget.subAccount.handleTableEventAction,
    fringesTableEventAction: actions.budget.handleFringesTableEventAction,
  });

  const subaccount = useSelector((s: Application.Store) =>
    selectors.selectSubAccountDetail(s, {
      id: props.id,
      domain: "budget",
      public: false,
    }),
  );

  useEffect(() => {
    dispatch(
      actions.budget.subAccount.requestSubAccountAction(null, {
        id: props.id,
        domain: "budget",
        public: false,
        budgetId: props.budgetId,
      }),
    );
  }, [props.id, props.budgetId]);

  useEffect(() => {
    if (!isNil(props.budget) && !isNil(subaccount)) {
      budgeting.urls.setLastVisited(props.budget, subaccount);
    }
  }, [props.budget, subaccount]);

  useEffect(() => {
    dispatch(
      actions.budget.subAccount.requestAction(null, {
        domain: "budget",
        parentType: "subaccount",
        budgetId: props.budgetId,
        public: false,
        parentId: props.id,
      }),
    );
  }, [props.id, props.budgetId]);

  return (
    <BudgetPage parent={subaccount} budget={props.budget}>
      <ConnectedTable
        {...props}
        parent={subaccount}
        tableContext={{
          parentId: props.id,
          budgetId: props.budgetId,
          parentType: "subaccount",
          domain: "budget",
          public: false,
        }}
        onExportPdf={() => setPreviewModalVisible(true)}
        onViewFringes={openFringesModal}
        table={table}
        onShared={(publicToken: Model.PublicToken) =>
          dispatch(
            actions.budget.updateBudgetInStateAction(
              { id: props.budgetId, data: { public_token: publicToken } },
              {},
            ),
          )
        }
        onShareUpdated={(publicToken: Model.PublicToken) =>
          dispatch(
            actions.budget.updateBudgetInStateAction(
              { id: props.budgetId, data: { public_token: publicToken } },
              {},
            ),
          )
        }
        onUnshared={() =>
          dispatch(
            actions.budget.updateBudgetInStateAction(
              { id: props.budgetId, data: { public_token: null } },
              {},
            ),
          )
        }
      />
      <FringesModal
        {...props}
        table={fringesTable}
        open={fringesModalVisible}
        parentType="subaccount"
        onCancel={() => closeFringesModal()}
      />
    </BudgetPage>
  );
};

export default SubAccount;
