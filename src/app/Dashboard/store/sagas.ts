import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, debounce } from "redux-saga/effects";

import { contacts } from "store/tasks";
import { tabling } from "lib";
import { ContactsTable } from "components/tabling";

import * as actions from "./actions";
import * as tasks from "./tasks";

function* watchForBudgetsRefreshSaga(): SagaIterator {
  yield takeLatest([actions.requestBudgetsAction.toString()], tasks.getBudgetsTask);
}

function* watchForTemplatesRefreshSaga(): SagaIterator {
  yield takeLatest([actions.requestTemplatesAction.toString()], tasks.getTemplatesTask);
}

function* watchForCommunityTemplatesRefreshSaga(): SagaIterator {
  yield takeLatest([actions.requestCommunityTemplatesAction.toString()], tasks.getCommunityTemplatesTask);
}

function* watchForSearchBudgetsSaga(): SagaIterator {
  yield debounce(250, actions.setBudgetsSearchAction.toString(), tasks.getBudgetsTask);
}

function* watchForSearchTemplatesSaga(): SagaIterator {
  yield debounce(250, actions.setTemplatesSearchAction.toString(), tasks.getTemplatesTask);
}

function* watchForSearchCommunityTemplatesSaga(): SagaIterator {
  yield debounce(250, actions.setCommunityTemplatesSearchAction.toString(), tasks.getCommunityTemplatesTask);
}

const ActionMap = {
  tableChanged: actions.handleContactsTableChangeEventAction,
  request: actions.requestContactsAction,
  loading: actions.loadingContactsAction,
  response: actions.responseContactsAction,
  saving: actions.savingContactsTableAction,
  addModelsToState: actions.addContactModelsToStateAction,
  setSearch: actions.setContactsSearchAction,
  clear: actions.clearContactsAction
};

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.ContactRowData,
  Model.Contact,
  Model.Group,
  Redux.TableTaskMap<Tables.ContactRowData, Model.Contact>,
  Redux.AuthenticatedTableActionMap<Tables.ContactRowData, Model.Contact, Model.Group>
>({
  actions: ActionMap,
  tasks: contacts.createTableTaskSet({
    selectData: (state: Application.Authenticated.Store) =>
      state["async-contacts-table"].data as Table.Row<Tables.ContactRowData, Model.Contact>[],
    columns: ContactsTable.Columns,
    actions: ActionMap
  })
});

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForTemplatesRefreshSaga);
  yield spawn(watchForSearchTemplatesSaga);
  yield spawn(watchForBudgetsRefreshSaga);
  yield spawn(watchForSearchBudgetsSaga);
  yield spawn(watchForCommunityTemplatesRefreshSaga);
  yield spawn(watchForSearchCommunityTemplatesSaga);
  yield spawn(tableSaga);
}
