import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, debounce } from "redux-saga/effects";

import { tabling, contacts } from "lib";

import * as actions from "./actions";
import * as tasks from "./tasks";

function* watchForBudgetsRefreshSaga(): SagaIterator {
  yield takeLatest(
    [actions.requestBudgetsAction.toString(), actions.setBudgetsPaginationAction.toString()],
    tasks.getBudgetsTask
  );
}

function* watchForBudgetsPermissioningRefreshSaga(): SagaIterator {
  yield takeLatest([actions.requestPermissioningBudgetsAction.toString()], tasks.getBudgetsPermissioningTask);
}

function* watchForTemplatesRefreshSaga(): SagaIterator {
  yield takeLatest(
    [actions.requestTemplatesAction.toString(), actions.setTemplatesPaginationAction.toString()],
    tasks.getTemplatesTask
  );
}

function* watchForCommunityTemplatesRefreshSaga(): SagaIterator {
  yield takeLatest(
    [actions.requestCommunityTemplatesAction.toString(), actions.setCommunityTemplatesPaginationAction.toString()],
    tasks.getCommunityTemplatesTask
  );
}

function* watchForSearchBudgetsSaga(): SagaIterator {
  yield debounce(250, actions.setBudgetsSearchAction.toString(), tasks.getBudgetsTask);
}

function* watchForUpdateBudgetsOrdering(): SagaIterator {
  yield takeLatest(actions.updateBudgetsOrderingAction.toString(), tasks.getBudgetsTask);
}

function* watchForSearchTemplatesSaga(): SagaIterator {
  yield debounce(250, actions.setTemplatesSearchAction.toString(), tasks.getTemplatesTask);
}

function* watchForUpdateTemplatesOrdering(): SagaIterator {
  yield takeLatest(actions.updateTemplatesOrderingAction.toString(), tasks.getTemplatesTask);
}

function* watchForSearchCommunityTemplatesSaga(): SagaIterator {
  yield debounce(250, actions.setCommunityTemplatesSearchAction.toString(), tasks.getCommunityTemplatesTask);
}

function* watchForUpdateCommunityTemplatesOrdering(): SagaIterator {
  yield takeLatest(actions.updateCommunityTemplatesOrderingAction.toString(), tasks.getCommunityTemplatesTask);
}

const ActionMap = {
  request: actions.requestContactsAction,
  tableChanged: actions.handleContactsTableChangeEventAction,
  loading: actions.loadingContactsAction,
  response: actions.responseContactsAction,
  saving: actions.savingContactsTableAction,
  addModelsToState: actions.addContactModelsToStateAction,
  setSearch: actions.setContactsSearchAction
};

export const createContactsTableSaga = (table: Table.TableInstance<Tables.ContactRowData, Model.Contact>) =>
  tabling.sagas.createAuthenticatedTableSaga<
    Tables.ContactRowData,
    Model.Contact,
    Tables.ContactTableContext,
    Redux.AuthenticatedTableActionMap<Tables.ContactRowData, Model.Contact, Tables.ContactTableContext>
  >({
    actions: ActionMap,
    tasks: contacts.tasks.createTableTaskSet({
      table,
      selectStore: (state: Application.AuthenticatedStore) => state.dashboard.contacts,
      actions: ActionMap
    })
  });

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForBudgetsPermissioningRefreshSaga);
  yield spawn(watchForTemplatesRefreshSaga);
  yield spawn(watchForSearchTemplatesSaga);
  yield spawn(watchForBudgetsRefreshSaga);
  yield spawn(watchForUpdateBudgetsOrdering);
  yield spawn(watchForUpdateTemplatesOrdering);
  yield spawn(watchForUpdateCommunityTemplatesOrdering);
  yield spawn(watchForSearchBudgetsSaga);
  yield spawn(watchForCommunityTemplatesRefreshSaga);
  yield spawn(watchForSearchCommunityTemplatesSaga);
}
