import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import * as api from "api";
import { framework } from "tabling/generic";

import { selectors } from "app/Budgeting/store";
import AuthenticatedTable, { AuthenticatedTableProps } from "./AuthenticatedTable";
import Columns from "./Columns";

type R = Tables.AccountRowData;
type M = Model.Account;

export type AuthenticatedBudgetProps = Omit<AuthenticatedTableProps<Model.Budget>, "domain" | "columns"> & {
  readonly onExportPdf: () => void;
  readonly onShared: (token: Model.PublicToken) => void;
  readonly onShareUpdated: (token: Model.PublicToken) => void;
  readonly onUnshared: () => void;
};

const AuthenticatedBudget = (props: AuthenticatedBudgetProps): JSX.Element => {
  const budget: Model.Budget | null = useSelector(
    (s: Application.Store) => selectors.selectBudgetDetail(s, { domain: "budget" }) as Model.Budget | null
  );

  const tableActions = useMemo(
    () => (params: Table.AuthenticatedMenuActionParams<R, M>) => {
      let _actions: Table.AuthenticatedMenuActions<R, M> = [
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ExportPdfAction(props.onExportPdf)
      ];
      if (!isNil(budget)) {
        _actions = [
          ..._actions,
          framework.actions.ShareAction<Model.Budget, R, M>({
            instance: budget,
            table: props.table.current,
            create: api.createBudgetPublicToken,
            onCreated: (token: Model.PublicToken) => props.onShared(token),
            onUpdated: (token: Model.PublicToken) => props.onShareUpdated(token),
            onDeleted: () => props.onUnshared()
          })
        ];
      }
      return _actions;
    },
    [budget, props.actions, props.onShared]
  );

  return <AuthenticatedTable<Model.Budget> {...props} domain={"budget"} columns={Columns} actions={tableActions} />;
};

export default React.memo(AuthenticatedBudget);
