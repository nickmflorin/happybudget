import React, { useMemo } from "react";

import * as api from "api";
import { isNil } from "lodash";

import { framework } from "deprecated/components/tabling/generic";

import AuthenticatedTable, { AuthenticatedTableProps } from "./AuthenticatedTable";
import Columns from "./Columns";

type R = Tables.AccountRowData;
type M = Model.Account;

export type AuthenticatedBudgetProps = Omit<
  AuthenticatedTableProps<Model.Budget>,
  "columns" | "includeCollaborators"
> & {
  readonly onExportPdf: () => void;
  readonly onShared: (token: Model.PublicToken) => void;
  readonly onShareUpdated: (token: Model.PublicToken) => void;
  readonly onUnshared: () => void;
};

const AuthenticatedBudget = (props: AuthenticatedBudgetProps): JSX.Element => {
  const tableActions = useMemo(
    () => (params: Table.AuthenticatedMenuActionParams<R, M>) => {
      let _actions: Table.AuthenticatedMenuActions<R, M> = [
        ...(isNil(props.actions)
          ? []
          : Array.isArray(props.actions)
          ? props.actions
          : props.actions(params)),
        framework.actions.ExportPdfAction(props.onExportPdf),
      ];
      if (!isNil(props.parent)) {
        _actions = [
          ..._actions,
          framework.actions.ShareAction<Model.Budget, R, M>({
            instance: props.parent,
            table: props.table.current,
            create: api.createBudgetPublicToken,
            onCreated: (token: Model.PublicToken) => props.onShared(token),
            onUpdated: (token: Model.PublicToken) => props.onShareUpdated(token),
            onDeleted: () => props.onUnshared(),
          }),
        ];
      }
      return _actions;
    },
    [props.parent, props.actions, props.onShared],
  );

  return (
    <AuthenticatedTable<Model.Budget>
      {...props}
      includeCollaborators={true}
      columns={Columns}
      actions={tableActions}
    />
  );
};

export default React.memo(AuthenticatedBudget);
