import { SagaIterator } from "redux-saga";
import { call, cancel, put, select } from "redux-saga/effects";
import { isNil, find } from "lodash";
import { handleRequestError } from "api";
import { AccountMapping } from "model/tableMappings";
import {
  getAccounts,
  deleteAccount,
  updateAccount,
  createAccount,
  getBudgetComments,
  createBudgetComment,
  deleteComment,
  updateComment,
  replyToComment,
  getAccountsHistory,
  deleteAccountGroup
} from "services";
import { handleTableErrors } from "store/tasks";
import { userToSimpleUser } from "model/mappings";
import { nowAsString } from "util/dates";
import { generateRandomNumericId } from "util/math";
import {
  loadingAccountsAction,
  responseAccountsAction,
  deletingAccountAction,
  creatingAccountAction,
  updatingAccountAction,
  loadingCommentsAction,
  responseCommentsAction,
  submittingCommentAction,
  addCommentToStateAction,
  deletingCommentAction,
  removeCommentFromStateAction,
  updateCommentInStateAction,
  editingCommentAction,
  replyingToCommentAction,
  loadingAccountsHistoryAction,
  responseAccountsHistoryAction,
  addAccountsHistoryToStateAction,
  deletingGroupAction,
  removeGroupFromStateAction,
  updateGroupInStateAction,
  updateAccountInStateAction,
  removeAccountFromStateAction,
  addAccountToStateAction,
  removePlaceholderFromStateAction,
  addPlaceholdersToStateAction,
  updatePlaceholderInStateAction,
  addErrorsToStateAction,
  activatePlaceholderAction
} from "./actions";

export function* removeAccountFromGroupTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(updatingAccountAction({ id: action.payload, value: true }));
    try {
      const account: IAccount = yield call(updateAccount, action.payload, { group: null });
      yield put(updateAccountInStateAction(account));
    } catch (e) {
      yield call(
        handleTableErrors,
        e,
        "There was an error removing the account from the group.",
        action.payload,
        (errors: Table.CellError[]) => addErrorsToStateAction(errors)
      );
    } finally {
      yield put(updatingAccountAction({ id: action.payload, value: false }));
    }
  }
}

export function* deleteAccountGroupTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingGroupAction({ id: action.payload, value: true }));
    try {
      yield call(deleteAccountGroup, action.payload);
      yield put(removeGroupFromStateAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the account group.");
    } finally {
      yield put(deletingGroupAction({ id: action.payload, value: false }));
    }
  }
}

export function* getHistoryTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingAccountsHistoryAction(true));
    try {
      const response: Http.IListResponse<HistoryEvent> = yield call(getAccountsHistory, budgetId);
      yield put(responseAccountsHistoryAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the accounts history.");
    } finally {
      yield put(loadingAccountsHistoryAction(false));
    }
  }
}

export function* addToHistoryState(
  account: IAccount,
  eventType: HistoryEventType,
  data?: { field: string; newValue: string | number; oldValue: string | number | null }
): SagaIterator {
  const user = yield select((state: Redux.IApplicationStore) => state.user);
  const polymorphicEvent: PolymorphicEvent = {
    id: generateRandomNumericId(),
    created_at: nowAsString(),
    type: eventType,
    user: userToSimpleUser(user),
    content_object: {
      id: account.id,
      identifier: account.identifier,
      description: account.description,
      type: "account"
    }
  };
  if (eventType === "field_alteration") {
    if (!isNil(data)) {
      yield put(
        addAccountsHistoryToStateAction({
          ...polymorphicEvent,
          new_value: data.newValue,
          old_value: data.oldValue,
          field: data.field
        })
      );
    }
  } else {
    yield put(addAccountsHistoryToStateAction(polymorphicEvent as CreateEvent));
  }
}

export function* submitCommentTask(
  action: Redux.IAction<{ parent?: number; data: Http.ICommentPayload }>
): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(replyingToCommentAction({ id: parent, value: true }));
    } else {
      yield put(submittingCommentAction(true));
    }
    try {
      let response: IComment;
      if (!isNil(parent)) {
        response = yield call(replyToComment, parent, data.text);
      } else {
        response = yield call(createBudgetComment, budgetId, data);
      }
      yield put(addCommentToStateAction({ data: response, parent }));
    } catch (e) {
      handleRequestError(e, "There was an error submitting the comment.");
    } finally {
      if (!isNil(parent)) {
        yield put(replyingToCommentAction({ id: parent, value: false }));
      } else {
        yield put(submittingCommentAction(false));
      }
    }
  }
}

export function* deleteCommentTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingCommentAction({ id: action.payload, value: true }));
    try {
      yield call(deleteComment, action.payload);
      yield put(removeCommentFromStateAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the comment.");
    } finally {
      yield put(deletingCommentAction({ id: action.payload, value: false }));
    }
  }
}

export function* editCommentTask(action: Redux.IAction<Redux.UpdateModelActionPayload<IComment>>): SagaIterator {
  if (!isNil(action.payload)) {
    const { id, data } = action.payload;
    yield put(editingCommentAction({ id, value: true }));
    try {
      // Here we are assuming that Partial<IComment> can be mapped to Partial<Http.ICommentPayload>,
      // which is the case right now but may not be in the future.
      const response: IComment = yield call(updateComment, id, data as Partial<Http.ICommentPayload>);
      yield put(updateCommentInStateAction({ id, data: response }));
    } catch (e) {
      handleRequestError(e, "There was an error updating the comment.");
    } finally {
      yield put(editingCommentAction({ id, value: false }));
    }
  }
}

export function* getCommentsTask(action: Redux.IAction<any>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(getBudgetComments, budgetId);
      yield put(responseCommentsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's comments.");
      yield put(responseCommentsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingCommentsAction(false));
    }
  }
}

// TODO: We need to also update the estimated, variance and actual values of the parent
// budget when an account is removed!
export function* handleAccountRemovalTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const models: IAccount[] = yield select((state: Redux.IApplicationStore) => state.calculator.budget.accounts.data);
    const model: IAccount | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      const placeholders = yield select(
        (state: Redux.IApplicationStore) => state.calculator.budget.accounts.placeholders
      );
      const placeholder: Table.AccountRow | undefined = find(placeholders, { id: action.payload });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.warn(
          `Inconsistent State!  Inconsistent state noticed when removing account...
          The account with ID ${action.payload} does not exist in state when it is expected to.`
        );
      } else {
        yield put(removePlaceholderFromStateAction(placeholder.id));
      }
    } else {
      yield put(removeAccountFromStateAction(model.id));
      yield put(deletingAccountAction({ id: model.id, value: true }));
      try {
        yield call(deleteAccount, model.id);
      } catch (e) {
        handleRequestError(e, "There was an error deleting the account.");
      } finally {
        yield put(deletingAccountAction({ id: model.id, value: false }));
      }
    }
  }
}

export function* handleAccountUpdatedInStateTask(action: Redux.IAction<IAccount>): SagaIterator {
  if (!isNil(action.payload)) {
    yield cancel();
    // NOTE: We do not need to update the calculated values of the overall budget when the Account
    // changes because direct updates to the Account itself do not affect the calculated fields
    // of the Account - only it's underlying SubAccount(s) do.
    const account = action.payload;
    // if (!isNil(account.group)) {
    //   yield put(updateGroupInStateAction(account.group));
    // }
  }
}

export function* handleAccountPlaceholderActivatedTask(
  action: Redux.IAction<Table.ActivatePlaceholderPayload<IAccount>>
): SagaIterator {
  if (!isNil(action.payload)) {
    // NOTE: We do not need to update the calculated values of the overall budget when the Account
    // changes because direct updates to the Account itself do not affect the calculated fields
    // of the Account - only it's underlying SubAccount(s) do.
    const account = action.payload.model;

    // Now that the placeholder is activated, we need to remove the placeholder from state and
    // insert in the actual Account model into the state.
    yield put(removePlaceholderFromStateAction(account.id));
    yield put(addAccountToStateAction(account));

    // We should probably remove the group from the table if the response Account does not have
    // a group - however, that will not happen in practice, because this task just handles the case
    // where the Account is updated (not removed or added to a group).
    // if (!isNil(account.group)) {
    //   yield put(updateGroupInStateAction(account.group));
    // }
  }
}

export function* handleAccountUpdateTask(action: Redux.IAction<Table.RowChange>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: IAccount[] = yield select((state: Redux.IApplicationStore) => state.calculator.budget.accounts.data);
    const model: IAccount | undefined = find(data, { id });
    if (isNil(model)) {
      const placeholders = yield select(
        (state: Redux.IApplicationStore) => state.calculator.budget.accounts.placeholders
      );
      const placeholder: Table.AccountRow | undefined = find(placeholders, { id });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating account in state...
          the account with ID ${action.payload.id} does not exist in state when it is expected to.`
        );
      } else {
        // There are some cases where we need to update the row in the table before we make the request,
        // to improve the UI.  This happens for cells where the value is rendered via an HTML element
        // (i.e. the Unit Cell).  AGGridReact will not automatically update the cell when the Unit is
        // changed via the dropdown, so we need to udpate the row in the data used to populate the table.
        // We could do this by updating with a payload generated from the response, but it is quicker
        // to do it before hand.
        const updatedRow = AccountMapping.newRowWithChanges(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction(updatedRow));

        const requestPayload = AccountMapping.postPayload(updatedRow);

        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (AccountMapping.rowHasRequiredFields(updatedRow)) {
          yield put(creatingAccountAction(true));
          try {
            const response: IAccount = yield call(createAccount, budgetId, requestPayload as Http.IAccountPayload);
            yield put(activatePlaceholderAction({ id: placeholder.id, model: response }));
          } catch (e) {
            yield call(
              handleTableErrors,
              e,
              "There was an error updating the account.",
              placeholder.id,
              (errors: Table.CellError[]) => addErrorsToStateAction(errors)
            );
          } finally {
            yield put(creatingAccountAction(false));
          }
        }
      }
    } else {
      // There are some cases where we need to update the row in the table before we make the request,
      // to improve the UI.  This happens for cells where the value is rendered via an HTML element
      // (i.e. the Unit Cell).  AGGridReact will not automatically update the cell when the Unit is
      // changed via the dropdown, so we need to udpate the row in the data used to populate the table.
      // We could do this by updating with a payload generated from the response, but it is quicker
      // to do it before hand.
      const updatedModel = AccountMapping.newModelWithChanges(model, action.payload);
      yield put(updateAccountInStateAction(updatedModel));

      yield put(updatingAccountAction({ id: model.id, value: true }));
      const requestPayload = AccountMapping.patchPayload(action.payload);
      try {
        // NOTE: Since the Account has no direct calculated fields (and we are only applying
        // direct updates here) we do not need to update the Account in the state from the
        // response.
        yield call(updateAccount, model.id, requestPayload);
      } catch (e) {
        yield call(
          handleTableErrors,
          e,
          "There was an error updating the sub account.",
          model.id,
          (errors: Table.CellError[]) => addErrorsToStateAction(errors)
        );
      } finally {
        yield put(updatingAccountAction({ id: model.id, value: false }));
      }
    }
  }
}

export function* getAccountsTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingAccountsAction(true));
    try {
      const response = yield call(getAccounts, budgetId, { no_pagination: true });
      yield put(responseAccountsAction(response));
      if (response.data.length === 0) {
        yield put(addPlaceholdersToStateAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's accounts.");
      yield put(responseAccountsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingAccountsAction(false));
    }
  }
}
