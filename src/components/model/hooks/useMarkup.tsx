import { useState, useMemo } from "react";

import { isNil } from "lodash";

import { CreateMarkupModal, EditMarkupModal } from "components/modals";

interface UseMarkupProps<
  R extends Tables.BudgetRowData,
  M extends model.RowTypedApiModel,
  B extends Model.BaseBudget,
  PARENT extends Model.Account | Model.SubAccount,
  RSP extends Http.MarkupResponseTypes<B, PARENT> = Http.MarkupResponseTypes<B, PARENT>,
> {
  readonly parentId: PARENT["id"];
  readonly parentType: PARENT["type"] | "budget";
  readonly table: Table.TableInstance<R, M>;
  readonly onResponse?: (response: RSP) => void;
}

type UseMarkupReturnType = [JSX.Element, (m: number) => void, (ms?: number[]) => void];

const useMarkup = <
  R extends Tables.BudgetRowData,
  M extends model.RowTypedApiModel,
  MM extends Model.Account | Model.SubAccount,
  B extends Model.BaseBudget,
  PARENT extends Model.Account | Model.SubAccount,
  RSP extends Http.MarkupResponseTypes<B, PARENT> = Http.MarkupResponseTypes<B, PARENT>,
>(
  props: UseMarkupProps<R, M, B, PARENT, RSP>,
): UseMarkupReturnType => {
  const [markupAccounts, setMarkupAccounts] = useState<number[] | null | undefined>(null);
  const [markupToEdit, setMarkupToEdit] = useState<number | null>(null);

  const createMarkupModal = useMemo((): JSX.Element => {
    if (markupAccounts !== null) {
      return (
        <CreateMarkupModal<MM, B, PARENT, R, M, RSP>
          parentId={props.parentId}
          parentType={props.parentType}
          table={props.table}
          children={markupAccounts}
          open={true}
          onSuccess={(response: RSP) => {
            /* Note: The table saga handles the dispatching of the event to add
               the model to state. */
            setMarkupAccounts(null);
            props.onResponse?.(response);
          }}
          onCancel={() => setMarkupAccounts(null)}
        />
      );
    }
    return <></>;
  }, [
    props.parentId,
    props.parentType,
    props.table,
    markupAccounts,
    setMarkupAccounts,
    props.onResponse,
  ]);

  const editMarkupModal = useMemo((): JSX.Element => {
    if (!isNil(markupToEdit)) {
      return (
        <EditMarkupModal<MM, B, PARENT, R, M, RSP>
          modelId={markupToEdit}
          parentId={props.parentId}
          parentType={props.parentType}
          table={props.table}
          open={true}
          onCancel={() => setMarkupToEdit(null)}
          onSuccess={(response: RSP) => {
            /* Note: The table saga handles the dispatching of the event to
						   update the model to state. */
            setMarkupToEdit(null);
            props.onResponse?.(response);
          }}
        />
      );
    }
    return <></>;
  }, [
    markupToEdit,
    props.parentId,
    props.parentType,
    props.table,
    setMarkupToEdit,
    props.onResponse,
  ]);

  const modals = useMemo(
    (): JSX.Element => (
      <>
        {createMarkupModal}
        {editMarkupModal}
      </>
    ),
    [createMarkupModal, editMarkupModal],
  );

  return [modals, setMarkupToEdit, setMarkupAccounts];
};

export default useMarkup;
