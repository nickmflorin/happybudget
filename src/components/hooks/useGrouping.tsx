import { useState, useMemo } from "react";
import { isNil } from "lodash";

import { tabling } from "lib";
import { CreateGroupModal, EditGroupModal } from "components/modals";

interface UseGroupingProps<R extends Tables.BudgetRowData, M extends Model.RowHttpModel> {
  readonly parentId: number;
  readonly parentType: Model.ParentType;
  readonly table: Table.TableInstance<R, M>;
  readonly onGroupUpdated: (group: Model.Group) => void;
}

type UseGroupingReturnType<R extends Tables.BudgetRowData> = [
  JSX.Element,
  (g: Table.GroupRow<R>) => void,
  (gs: number[]) => void
];

const useGrouping = <R extends Tables.BudgetRowData, M extends Model.RowHttpModel>(
  props: UseGroupingProps<R, M>
): UseGroupingReturnType<R> => {
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Table.GroupRow<R> | undefined>(undefined);

  const createGroupModal = useMemo((): JSX.Element => {
    if (!isNil(groupAccounts)) {
      return (
        <CreateGroupModal
          id={props.parentId}
          table={props.table}
          parentType={props.parentType}
          children={groupAccounts}
          open={true}
          onSuccess={() => setGroupAccounts(undefined)}
          onCancel={() => setGroupAccounts(undefined)}
        />
      );
    }
    return <></>;
  }, [props.table, props.parentId, props.parentType, props.table, groupAccounts, setGroupAccounts]);

  const editGroupModal = useMemo((): JSX.Element => {
    if (!isNil(groupToEdit)) {
      return (
        <EditGroupModal
          id={tabling.rows.groupId(groupToEdit.id)}
          parentId={props.parentId}
          parentType={props.parentType}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.Group) => {
            setGroupToEdit(undefined);
            props.onGroupUpdated(group);
          }}
        />
      );
    }
    return <></>;
  }, [groupToEdit, props.parentId, props.parentType, props.table, setGroupToEdit, props.onGroupUpdated]);

  const modals = useMemo((): JSX.Element => {
    return (
      <>
        {createGroupModal}
        {editGroupModal}
      </>
    );
  }, [createGroupModal, editGroupModal]);

  return [modals, setGroupToEdit, setGroupAccounts];
};

export default useGrouping;
