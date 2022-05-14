import React, { useMemo, useState } from "react";
import { isNil } from "lodash";

import * as config from "config";
import { tabling } from "lib";
import { AuthenticatedTable, AuthenticatedTableProps, framework } from "tabling/generic";

import { CollaboratorsModal } from "components/modals";
import { Framework } from "./framework";

export type AuthenticatedBudgetTableProps<
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
> = AuthenticatedTableProps<R, M, S> & {
  readonly budgetId: number;
  readonly includeCollaborators: boolean;
  readonly onEditMarkup?: (row: Table.MarkupRow<R>) => void;
  readonly onEditGroup?: (row: Table.GroupRow<R>) => void;
  readonly onRowExpand?: (row: Table.ModelRow<R>) => void;
};

const AuthenticatedBudgetTable = <
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
>({
  includeCollaborators,
  onEditMarkup,
  onEditGroup,
  onRowExpand,
  ...props
}: AuthenticatedBudgetTableProps<R, M, S>): JSX.Element => {
  const [collaboratorsModalOpen, setCollaboratorsModalOpen] = useState(false);

  const actions = useMemo<Table.AuthenticatedMenuActions<R, M>>(
    (): Table.AuthenticatedMenuActions<R, M> =>
      config.env.COLLABORATION_ENABLED && includeCollaborators
        ? tabling.menu.combineMenuActions<Table.AuthenticatedMenuActionParams<R, M>, R, M>(
            () => [
              framework.actions.CollaboratorsAction({
                location: "right",
                onClick: () => setCollaboratorsModalOpen(true)
              })
            ],
            !isNil(props.actions) ? props.actions : []
          )
        : !isNil(props.actions)
        ? props.actions
        : [],
    [props.actions]
  );

  const editColumnConfig = useMemo(() => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let c: Table.EditColumnRowConfig<R, any>[] = [];
    if (!isNil(onEditMarkup)) {
      c = [
        ...c,
        {
          typeguard: tabling.rows.isMarkupRow,
          action: (r: Table.MarkupRow<R>) => onEditMarkup(r),
          behavior: "edit"
        }
      ];
    }
    if (!isNil(onEditGroup)) {
      c = [
        ...c,
        {
          typeguard: tabling.rows.isGroupRow,
          action: (r: Table.GroupRow<R>) => onEditGroup(r),
          behavior: "edit"
        }
      ];
    }
    if (!isNil(onRowExpand)) {
      c = [
        ...c,
        {
          typeguard: tabling.rows.isModelRow,
          action: (r: Table.ModelRow<R>) => onRowExpand(r),
          behavior: "expand"
        }
      ];
    }
    return c;
  }, [onEditMarkup, onEditGroup, onRowExpand]);

  return (
    <React.Fragment>
      <AuthenticatedTable
        {...props}
        actions={actions}
        editColumnConfig={editColumnConfig}
        framework={tabling.aggrid.combineFrameworks(Framework, props.framework)}
      />
      {collaboratorsModalOpen === true && includeCollaborators && (
        <CollaboratorsModal open={true} onCancel={() => setCollaboratorsModalOpen(false)} budgetId={props.budgetId} />
      )}
    </React.Fragment>
  );
};

export default React.memo(AuthenticatedBudgetTable) as typeof AuthenticatedBudgetTable;
