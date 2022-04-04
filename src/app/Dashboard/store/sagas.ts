import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, debounce } from "redux-saga/effects";

import { tabling } from "lib";
import * as store from "store";

import * as actions from "./actions";
import * as tasks from "./tasks";

function* watchForRequestSaga(): SagaIterator {
  yield takeLatest([actions.requestDataAction.toString()], tasks.getDataTask);
}

function* watchForBudgetsRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      actions.requestBudgetsAction.toString(),
      actions.setBudgetsPaginationAction.toString(),
      actions.updateBudgetsOrderingAction.toString()
    ],
    tasks.getBudgetsTask
  );
}

function* watchForBudgetsPermissioningRefreshSaga(): SagaIterator {
  yield takeLatest([actions.requestPermissioningBudgetsAction.toString()], tasks.getBudgetsPermissioningTask);
}

function* watchForSearchBudgetsSaga(): SagaIterator {
  yield debounce(250, actions.setBudgetsSearchAction.toString(), tasks.getBudgetsTask);
}

function* watchForArchiveRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      actions.requestArchiveAction.toString(),
      actions.setArchivePaginationAction.toString(),
      actions.updateArchiveOrderingAction.toString()
    ],
    tasks.getArchiveTask
  );
}

function* watchForSearchArchiveSaga(): SagaIterator {
  yield debounce(250, actions.setArchiveSearchAction.toString(), tasks.getArchiveTask);
}

function* watchForCollaboratingRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      actions.requestCollaboratingAction.toString(),
      actions.setCollaboratingPaginationAction.toString(),
      actions.updateCollaboratingOrderingAction.toString()
    ],
    tasks.getCollaboratingTask
  );
}

function* watchForSearchCollaboratingSaga(): SagaIterator {
  yield debounce(250, actions.setCollaboratingSearchAction.toString(), tasks.getCollaboratingTask);
}

function* watchForArchivePermissioningRefreshSaga(): SagaIterator {
  yield takeLatest([actions.requestPermissioningArchiveAction.toString()], tasks.getArchivePermissioningTask);
}

function* watchForTemplatesRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      actions.requestTemplatesAction.toString(),
      actions.setTemplatesPaginationAction.toString(),
      actions.updateTemplatesOrderingAction.toString()
    ],
    tasks.getTemplatesTask
  );
}

function* watchForSearchTemplatesSaga(): SagaIterator {
  yield debounce(250, actions.setTemplatesSearchAction.toString(), tasks.getTemplatesTask);
}

function* watchForCommunityRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      actions.requestCommunityAction.toString(),
      actions.setCommunityPaginationAction.toString(),
      actions.updateCommunityOrderingAction.toString()
    ],
    tasks.getCommunityTask
  );
}

function* watchForSearchCommunitySaga(): SagaIterator {
  yield debounce(250, actions.setCommunitySearchAction.toString(), tasks.getCommunityTask);
}

const ActionMap = {
  request: actions.requestContactsAction,
  handleEvent: actions.handleContactsTableEventAction,
  loading: actions.loadingContactsAction,
  response: actions.responseContactsAction,
  setSearch: actions.setContactsSearchAction
};

export const createContactsTableSaga = (table: Table.TableInstance<Tables.ContactRowData, Model.Contact>) =>
  tabling.sagas.createAuthenticatedTableSaga<
    Tables.ContactRowData,
    Model.Contact,
    Tables.ContactTableStore,
    Tables.ContactTableContext
  >({
    actions: ActionMap,
    selectStore: (state: Application.Store) => state.dashboard.contacts,
    tasks: store.tasks.contacts.createTableTaskSet({
      table,
      selectStore: (state: Application.Store) => state.dashboard.contacts,
      actions: ActionMap
    })
  });

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForTemplatesRefreshSaga);
  yield spawn(watchForSearchTemplatesSaga);
  yield spawn(watchForBudgetsRefreshSaga);
  yield spawn(watchForBudgetsPermissioningRefreshSaga);
  yield spawn(watchForSearchBudgetsSaga);
  yield spawn(watchForCollaboratingRefreshSaga);
  yield spawn(watchForSearchCollaboratingSaga);
  yield spawn(watchForArchiveRefreshSaga);
  yield spawn(watchForArchivePermissioningRefreshSaga);
  yield spawn(watchForSearchArchiveSaga);
  yield spawn(watchForCommunityRefreshSaga);
  yield spawn(watchForSearchCommunitySaga);
  yield spawn(watchForRequestSaga);
}
