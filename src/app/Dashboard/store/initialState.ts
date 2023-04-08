import { redux } from "lib";

const initialState: Modules.Dashboard.Store = {
  budgets: {
    ...redux.initialAuthenticatedApiModelListResponseState,
    pageSize: 100,
    ordering: [
      { field: "created_at", order: 0 },
      { field: "updated_at", order: -1 },
      { field: "name", order: 0 },
    ],
  },
  collaborating: {
    ...redux.initialAuthenticatedApiModelListResponseState,
    pageSize: 100,
    ordering: [
      { field: "created_at", order: 0 },
      { field: "updated_at", order: -1 },
      { field: "name", order: 0 },
    ],
  },
  archive: {
    ...redux.initialAuthenticatedApiModelListResponseState,
    pageSize: 100,
    ordering: [
      { field: "created_at", order: 0 },
      { field: "updated_at", order: -1 },
      { field: "name", order: 0 },
    ],
  },
  templates: {
    ...redux.initialAuthenticatedApiModelListResponseState,
    pageSize: 100,
    ordering: [
      { field: "created_at", order: 0 },
      { field: "updated_at", order: -1 },
      { field: "name", order: 0 },
    ],
  },
  community: {
    ...redux.initialAuthenticatedApiModelListResponseState,
    pageSize: 100,
    ordering: [
      { field: "created_at", order: 0 },
      { field: "updated_at", order: 0 },
      { field: "name", order: 1 },
    ],
  },
  contacts: redux.initialTableState,
};

export default initialState;
