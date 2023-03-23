import { SagaIterator } from "redux-saga";

import { tabling } from "lib";

import * as actions from "./actions";

export type Task<
  P extends actions.ActionPayload = actions.ActionPayload,
  C extends actions.ActionContext = actions.ActionContext,
> = (action: actions.Action<P, C>) => SagaIterator;

export type ContextTask<C extends actions.ActionContext = actions.ActionContext> = (
  context?: C,
) => SagaIterator;

export type TableChangeEventTask<
  E extends tabling.ChangeEventId,
  R extends tabling.TableEventArg<E>,
  C extends actions.ActionContext = actions.ActionContext,
> = (e: tabling.ChangeEvent<E, R>, context: C) => SagaIterator;

export type TableChangeEventTaskMapObject<
  R extends tabling.Row,
  C extends actions.ActionContext = actions.ActionContext,
> = {
  readonly dataChange: TableChangeEventTask<"dataChange", R, C>;
  readonly rowAdd: TableChangeEventTask<"rowAdd", R, C>;
  readonly groupAdd: TableChangeEventTask<"groupAdd", never, C>;
  readonly groupUpdate: TableChangeEventTask<"groupAdd", never, C>;
  readonly markupAdd: TableChangeEventTask<"markupAdd", never, C>;
  readonly markupUpdate: TableChangeEventTask<"markupUpdate", never, C>;
  readonly rowInsert: TableChangeEventTask<"rowInsert", R, C>;
  readonly rowPositionChanged: TableChangeEventTask<"rowPositionChanged", never, C>;
  readonly rowDelete: TableChangeEventTask<"rowDelete", never, C>;
  readonly rowRemoveFromGroup: TableChangeEventTask<"rowRemoveFromGroup", never, C>;
  readonly rowAddToGroup: TableChangeEventTask<"rowAddToGroup", never, C>;
};

export type ListTaskMap<C extends actions.ActionContext = actions.ActionContext> = {
  readonly request: Task<actions.RequestActionPayload, C> | Task<null, C>;
};

export type ModelListTaskMap<C extends actions.ActionContext = actions.ActionContext> = {
  readonly request: Task<actions.RequestActionPayload, C> | Task<null, C>;
};

export type TableTaskMap<C extends actions.ActionContext = actions.ActionContext> = {
  readonly request: Task<actions.TableRequestActionPayload, C> | Task<null, C>;
};

export type AuthenticatedTableTaskMap<
  R extends tabling.Row,
  C extends actions.ActionContext = actions.ActionContext,
> = TableTaskMap<C> & {
  readonly handleChangeEvent: TableChangeEventTask<tabling.ChangeEventId, R, C>;
};

export type TaskConfig<
  A extends actions.ActionCreatorMap<actions.ActionPayloadMap, C>,
  C extends actions.ActionContext = actions.ActionContext,
> = {
  readonly actions: Omit<A, "request">;
};

export type SagaConfig<
  T,
  A extends actions.ActionCreatorMap<actions.ActionPayloadMap, C>,
  C extends actions.ActionContext = actions.ActionContext,
> = {
  readonly tasks: T;
  readonly actions: A;
};
