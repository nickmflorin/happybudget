import { Reducer } from "redux";
import { isNil, reduce, map, includes, filter, uniq, flatten } from "lodash";

import { tabling, util, redux, model } from "lib";

export const createTableChangeEventReducer = <
  R extends Table.Row,
  M extends Model.Model,
  S extends Redux.TableStore<M> = Redux.TableStore<M>
>(
  /* eslint-disable indent */
  initialState: S,
  options?: Pick<Redux.FindModelOptions, "name">
) => {
  return (state: S = initialState, action: Redux.Action<Table.ChangeEvent<R, M>>): S => {
    let newState: S = { ...state };

    // The table change e that is attached to the action.
    const e: Table.ChangeEvent<R, M> = action.payload;

    if (tabling.typeguards.isDataChangeEvent(e)) {
      const consolidated = tabling.util.consolidateTableChange(e.payload);

      // The consolidated changes should contain one change per Account/SubAccount, but
      // just in case we apply that grouping logic here.
      let changesPerModel: {
        [key: number]: { changes: Table.RowChange<R, M>[]; model: M };
      } = {};
      for (let i = 0; i < consolidated.length; i++) {
        if (isNil(changesPerModel[consolidated[i].id])) {
          const m: M | null = redux.reducers.findModelInData<M>(action, newState.data, consolidated[i].id, options);
          if (!isNil(m)) {
            changesPerModel[consolidated[i].id] = { changes: [], model: m };
          }
        }
        if (!isNil(changesPerModel[consolidated[i].id])) {
          changesPerModel[consolidated[i].id] = {
            ...changesPerModel[consolidated[i].id],
            changes: [...changesPerModel[consolidated[i].id].changes, consolidated[i]]
          };
        }
      }
      // For each of the children Account(s) or SubAccount(s) that were changed,
      // apply those changes to the current Account/SubAccount model in state.
      newState = reduce(
        changesPerModel,
        (s: S, data: { changes: Table.RowChange<R, M>[]; model: M }) => {
          let m: M = reduce(
            data.changes,
            (mi: M, change: Table.RowChange<R, M>) => tabling.util.mergeChangesWithModel(mi, change),
            data.model
          );
          return {
            ...s,
            data: util.replaceInArray<M>(s.data, { id: m.id }, m)
          };
        },
        newState
      );
    } else if (tabling.typeguards.isRowAddEvent(e)) {
      // Eventually, we will want to implement this - so we do not have to rely on waiting
      // for the response of the API request.
    } else if (tabling.typeguards.isFullRowEvent(e)) {
      const ids = Array.isArray(e.payload.rows) ? map(e.payload.rows, (row: R) => row.id) : [e.payload.rows.id];
      if (tabling.typeguards.isRowDeleteEvent(e)) {
        newState = reduce(
          ids,
          (s: S, id: number) => {
            const m: M | null = redux.reducers.modelFromState<M, M[]>(action, newState.data, id);
            if (!isNil(m)) {
              return {
                ...s,
                data: filter(s.data, (mi: M) => mi.id !== m.id),
                count: s.count - 1
              };
            }
            return s;
          },
          newState
        );
      }
    }
    return newState;
  };
};

export const createTableReducer = <
  R extends Table.Row,
  M extends Model.Model,
  S extends Redux.TableStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  /* eslint-disable indent */
  mappings: Redux.TableActionMap,
  initialState: S
): Reducer<S, A> => {
  const genericReducer: Reducer<S, A> = redux.reducers.factories.createSimpleTableReducer(mappings);
  const tableEventReducer = createTableChangeEventReducer<R, M, S>(initialState);
  return (state: S = initialState, action: A) => {
    let newState: S = genericReducer(state, action);
    if (action.type === mappings.TableChanged) {
      newState = tableEventReducer(newState, action);
    }
    return newState;
  };
};

const groupFromState = <
  M extends Model.Account | Model.SubAccount,
  S extends Redux.BudgetTableStore<M> = Redux.BudgetTableStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  action: A,
  st: S,
  id: Model.Group | number,
  lineId?: number,
  options: Redux.FindModelOptions = { name: "Group", warnIfMissing: true }
): Model.Group | null => {
  if (typeof id === "number") {
    let predicate = (g: Model.Group) => g.id === id;
    if (!isNil(lineId)) {
      predicate = (g: Model.Group) => g.id === id && includes(g.children, lineId);
    }
    return redux.reducers.modelFromState<Model.Group>(action, st.groups.data, predicate, options);
  }
  return id;
};

const modelGroupFromState = <M extends Model.Account | Model.SubAccount>(
  action: Redux.Action<any>,
  st: Redux.BudgetTableStore<M>,
  lineId: number,
  options: Redux.FindModelOptions = { warnIfMissing: true }
): Model.Group | null => {
  const predicate = (g: Model.Group) => includes(g.children, lineId);
  return redux.reducers.modelFromState<Model.Group>(action, st.groups.data, predicate, {
    ...options,
    name: "Group"
  });
};

const recalculateGroupMetrics = <
  M extends Model.Account | Model.SubAccount,
  S extends Redux.BudgetTableStore<M> = Redux.BudgetTableStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  /* eslint-disable indent */
  action: A,
  st: S,
  group: Model.Group | number
): S => {
  const stateGroup = groupFromState<M>(action, st, group);
  if (!isNil(stateGroup)) {
    const objs = redux.reducers.findModelsInData<M>(action, st.data, stateGroup.children, {
      name: "Group child account/sub-account"
    });
    let payload: any = {
      estimated: reduce(objs, (sum: number, s: Model.Account | Model.SubAccount) => sum + (s.estimated || 0), 0)
    };
    const actual = reduce(objs, (sum: number, s: Model.Account | Model.SubAccount) => sum + (s.actual || 0), 0);
    payload = { ...payload, actual, variance: payload.estimated - actual };
    return {
      ...st,
      groups: {
        ...st.groups,
        data: util.replaceInArray<Model.Group>(st.groups.data, { id: stateGroup.id }, { ...stateGroup, ...payload })
      }
    };
  }
  return st;
};

const removeRowFromGroup = <
  M extends Model.Account | Model.SubAccount,
  S extends Redux.BudgetTableStore<M> = Redux.BudgetTableStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  action: A,
  st: S,
  id: number,
  group?: number,
  options: Redux.FindModelOptions = { warnIfMissing: true }
): [S, number | null] => {
  let newGroup: Model.Group | null = null;
  const m: M | null = redux.reducers.modelFromState<M>(action, st.data, id);
  if (!isNil(m)) {
    newGroup = !isNil(group)
      ? groupFromState<M>(action, st, group, id)
      : modelGroupFromState<M>(action, st, m.id, options);
    if (!isNil(newGroup)) {
      newGroup = {
        ...newGroup,
        children: filter(newGroup.children, (child: number) => child !== m.id)
      };
      st = {
        ...st,
        groups: {
          ...st.groups,
          data: util.replaceInArray<Model.Group>(st.groups.data, { id: newGroup.id }, newGroup)
        }
      };
    }
  }
  return [st, !isNil(newGroup) ? newGroup.id : null];
};

const removeRowsFromGroup = <
  M extends Model.Account | Model.SubAccount,
  S extends Redux.BudgetTableStore<M> = Redux.BudgetTableStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  st: S,
  action: A,
  rows: number[],
  group?: number,
  options: Redux.FindModelOptions = { warnIfMissing: true }
): [S, number[]] => {
  let groups: number[] = [];
  st = reduce(
    rows,
    (s: S, row: number) => {
      const [newState, updatedGroup] = removeRowFromGroup<M, S, A>(action, st, row, group, options);
      groups = !isNil(updatedGroup) ? [...groups, updatedGroup] : groups;
      return newState;
    },
    st
  );
  return [st, uniq(groups)];
};

const isBudgetTableWithFringesStore = <M extends Model.Account | Model.SubAccount>(
  s: Redux.BudgetTableStore<M> | Redux.BudgetTableWithFringesStore<M>
): s is Redux.BudgetTableWithFringesStore<M> => (s as Redux.BudgetTableWithFringesStore<M>).fringes !== undefined;

const recalculateSubAccountMetrics = <
  M extends Model.Account | Model.SubAccount,
  S extends Redux.BudgetTableStore<M> = Redux.BudgetTableStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  st: S,
  action: A,
  sub: Model.SubAccount
): Model.SubAccount => {
  let newSubAccount = { ...sub };
  /*
  In the case that the SubAccount has SubAccount(s) itself, the estimated value is determined
  from the accumulation of the estimated values for those children SubAccount(s).  In this
  case,  we do not need to update the SubAccount estimated value in state because it only
  changes when the estimated values of it's SubAccount(s) on another page are altered.
  */
  if (newSubAccount.subaccounts.length === 0 && !isNil(newSubAccount.quantity) && !isNil(newSubAccount.rate)) {
    const multiplier = newSubAccount.multiplier || 1.0;
    let payload: any = {
      estimated: multiplier * newSubAccount.quantity * newSubAccount.rate
    };
    if (!isNil(newSubAccount.actual) && !isNil(payload.estimated)) {
      payload = { ...payload, variance: payload.estimated - newSubAccount.actual };
    }
    newSubAccount = { ...newSubAccount, ...payload };
    if (isBudgetTableWithFringesStore(st)) {
      // Reapply the fringes to the SubAccount's estimated value.
      newSubAccount = {
        ...newSubAccount,
        estimated: model.util.fringeValue(
          newSubAccount.estimated,
          redux.reducers.findModelsInData(action, st.fringes.data, newSubAccount.fringes, { name: "Fringe" })
        )
      };
    }
  }
  return newSubAccount;
};

export const createBudgetTableChangeEventReducer = <
  M extends Model.Account | Model.SubAccount,
  S extends Redux.BudgetTableStore<M> = Redux.BudgetTableStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  initialState: S,
  options?: Pick<Redux.FindModelOptions, "name">
): Reducer<S, A> => {
  type R = M extends Model.Account ? Tables.AccountRow : Tables.SubAccountRow;
  return (state: S = initialState, action: Redux.Action<Table.ChangeEvent<R, M>>): S => {
    let newState: S = { ...state };

    // The table change e that is attached to the action.
    const e: Table.ChangeEvent<R, M> = action.payload;

    if (tabling.typeguards.isDataChangeEvent(e)) {
      const consolidated = tabling.util.consolidateTableChange(e.payload);

      // The consolidated changes should contain one change per Account/SubAccount, but
      // just in case we apply that grouping logic here.
      let changesPerModel: {
        [key: number]: { changes: Table.RowChange<R, M>[]; model: M };
      } = {};
      for (let i = 0; i < consolidated.length; i++) {
        if (isNil(changesPerModel[consolidated[i].id])) {
          const m: M | null = redux.reducers.findModelInData<M>(action, newState.data, consolidated[i].id, options);
          if (!isNil(m)) {
            changesPerModel[consolidated[i].id] = { changes: [], model: m };
          }
        }
        if (!isNil(changesPerModel[consolidated[i].id])) {
          changesPerModel[consolidated[i].id] = {
            ...changesPerModel[consolidated[i].id],
            changes: [...changesPerModel[consolidated[i].id].changes, consolidated[i]]
          };
        }
      }
      // For each of the children Account(s) or SubAccount(s) that were changed,
      // apply those changes to the current Account/SubAccount model in state.
      newState = reduce(
        changesPerModel,
        (s: S, data: { changes: Table.RowChange<R, M>[]; model: M }) => {
          let m: M = reduce(
            data.changes,
            (mi: M, change: Table.RowChange<R, M>) => tabling.util.mergeChangesWithModel(mi, change),
            data.model
          );
          /*
          If the changes to the model warrant recalculation and the model is a SubAccount,
          we need to recalculate the metrics for that specific SubAccount.  Note that this
          behavior does not apply to Account(s), since there are no fields we can update on
          an Account that warrant recalculation.
          */
          if (tabling.util.changeWarrantsRecalculation(data.changes) && model.typeguards.isSubAccount(m)) {
            // We have to force coerce to M because it does not know that M has now been restricted to the SubAccount case.
            m = recalculateSubAccountMetrics<M, S, A>(s, action as A, m) as M;
          }
          s = {
            ...s,
            data: util.replaceInArray<M>(s.data, { id: m.id }, m)
          };
          /*
          NOTE: Right now, in regard to the Account(s) case (when there are several Account(s),
          not a single Account with several SubAccount(s) - i.e. the case when
          S = Modules.Budget.BudgetStore) there are no changes to a single AccountRow that
          would warrant recalculation of higher level fields - however, we might have them in
          the future, if there is a column that specifies isCalculating, so we perform
          this logic regardless of whether or not the rows are AccountRow or SubAccountRow.
          */
          if (tabling.util.eventWarrantsGroupRecalculation(e)) {
            // The Group might not necessarily exist.
            const rowGroup = modelGroupFromState<M>(action, s, m.id, {
              name: "Group",
              warnIfMissing: false
            });
            if (!isNil(rowGroup)) {
              s = recalculateGroupMetrics<M, S, A>(action as A, s, rowGroup);
            }
          }
          return s;
        },
        newState
      );
    } else if (tabling.typeguards.isRowAddEvent(e)) {
      // Eventually, we will want to implement this - so we do not have to rely on waiting
      // for the response of the API request.
    } else if (tabling.typeguards.isFullRowEvent(e)) {
      const ids = Array.isArray(e.payload.rows)
        ? map(e.payload.rows, (row: Tables.AccountRow) => row.id)
        : [e.payload.rows.id];

      if (tabling.typeguards.isRowDeleteEvent(e)) {
        // We cannot supply the Group ID because we do not know what Group each row belonged to
        // yet.  That is handled by the removeRowsFromGroup method.
        const [updatedState, groups] = removeRowsFromGroup<M, S, A>(newState, action as A, ids, undefined, {
          warnIfMissing: false
        });
        newState = { ...updatedState };
        newState = reduce(
          ids,
          (s: S, id: number) => {
            const m: M | null = redux.reducers.modelFromState<M, M[]>(action, newState.data, id);
            if (!isNil(m)) {
              return {
                ...s,
                data: filter(s.data, (mi: M) => mi.id !== m.id),
                count: s.count - 1
              };
            }
            return s;
          },
          newState
        );
        if (tabling.util.eventWarrantsGroupRecalculation(e)) {
          newState = reduce(groups, (s: S, id: number) => recalculateGroupMetrics(action, s, id), newState);
        }
      } else if (tabling.typeguards.isRowRemoveFromGroupEvent(e)) {
        // NOTE: Since we are supplying the actual Group ID here, the Groups returned from the
        // function will only ever have one ID (the original ID we passed in).
        const [updatedState, groups] = removeRowsFromGroup(newState, action as A, ids, e.payload.group);
        newState = { ...updatedState };
        if (tabling.util.eventWarrantsGroupRecalculation(e)) {
          newState = reduce(groups, (s: S, id: number) => recalculateGroupMetrics(action, s, id), newState);
        }
      } else if (tabling.typeguards.isRowAddToGroupEvent(e)) {
        const g: Model.Group | null = groupFromState<M>(action, newState, e.payload.group);
        if (!isNil(g)) {
          const [updatedState, wasUpdated]: [S, boolean] = reduce(
            ids,
            (current: [S, boolean], id: number): [S, boolean] => {
              const m = redux.reducers.modelFromState<M>(action, newState.data, id);
              if (!isNil(m)) {
                if (includes(g.children, m.id)) {
                  redux.util.warnInconsistentState({
                    action,
                    reason: "Model already exists as a child for group.",
                    id: m.id,
                    group: g.id
                  });
                  return current;
                } else {
                  return [
                    {
                      ...current[0],
                      groups: {
                        ...current[0].groups,
                        data: util.replaceInArray<Model.Group>(
                          current[0].groups.data,
                          { id: g.id },
                          {
                            ...g,
                            children: [...g.children, m.id]
                          }
                        )
                      }
                    },
                    true
                  ];
                }
              }
              return current;
            },
            [newState, false]
          );
          newState = { ...updatedState };
          if (tabling.util.eventWarrantsGroupRecalculation(e) && wasUpdated === true) {
            newState = recalculateGroupMetrics(action, newState, e.payload.group);
          }
        }
      }
    } else if (tabling.typeguards.isGroupDeleteEvent(e)) {
      // NOTE: We do not have to worry about recalculation of any metrics in this case.
      const group: Model.Group | null = groupFromState<M>(action, newState, e.payload);
      if (!isNil(group)) {
        newState = {
          ...newState,
          groups: {
            ...newState.groups,
            data: filter(newState.groups.data, (g: Model.Group) => g.id !== e.payload),
            count: newState.groups.count - 1
          }
        };
      }
    }
    return newState;
  };
};

const createSimpleBudgetTableReducer = <
  M extends Model.Model,
  S extends Redux.BudgetTableStore<M> = Redux.BudgetTableStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  /* eslint-disable indent */
  mappings: Redux.BudgetTableActionMap,
  initialState: S
): Reducer<S, A> => {
  let subReducers = {};
  if (!isNil(mappings.Groups)) {
    subReducers = {
      ...subReducers,
      groups: redux.reducers.factories.createSimpleTableReducer<Model.Group>(mappings.Groups)
    };
  }
  return redux.reducers.factories.createSimpleTableReducer<M, S, A>(mappings, {
    initialState,
    subReducers
  });
};

export const createBudgetTableReducer = <
  M extends Model.Account | Model.SubAccount,
  S extends Redux.BudgetTableStore<M> = Redux.BudgetTableStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  mappings: Redux.BudgetTableActionMap,
  initialState: S
): Reducer<S, A> => {
  const genericReducer: Reducer<S, A> = createSimpleBudgetTableReducer(mappings, initialState);
  const tableEventReducer = createBudgetTableChangeEventReducer<M, S, A>(initialState);
  return (state: S = initialState, action: A) => {
    let newState: S = genericReducer(state, action);
    if (action.type === mappings.TableChanged) {
      newState = tableEventReducer(newState, action);
    }
    return newState;
  };
};

const createSimpleBudgetTableWithFringesReducer = <
  M extends Model.Model,
  S extends Redux.BudgetTableWithFringesStore<M> = Redux.BudgetTableWithFringesStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  /* eslint-disable indent */
  mappings: Redux.BudgetTableWithFringesActionMap,
  initialState: S
): Reducer<S, A> => {
  let subReducers = {};
  if (!isNil(mappings.Groups)) {
    subReducers = {
      ...subReducers,
      groups: redux.reducers.factories.createSimpleTableReducer<Model.Group>(mappings.Groups),
      fringes: createTableReducer<Tables.FringeRow, Model.Fringe, Redux.TableStore<Model.Fringe>, A>(
        mappings.Fringes,
        initialState.fringes
      )
    };
  }
  return redux.reducers.factories.createSimpleTableReducer<M, S, A>(mappings, {
    initialState,
    subReducers
  });
};

export const createBudgetTableWithFringesReducer = <
  M extends Model.SubAccount,
  S extends Redux.BudgetTableWithFringesStore<M> = Redux.BudgetTableWithFringesStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  mappings: Redux.BudgetTableWithFringesActionMap,
  initialState: S
): Reducer<S, A> => {
  const genericReducer: Reducer<S, A> = createSimpleBudgetTableWithFringesReducer<M, S, A>(mappings, initialState);

  type GenericEvent = Table.ChangeEvent<Tables.FringeRow | Tables.SubAccountRow, Model.Fringe | Model.SubAccount>;
  type FringeEvent = Table.ChangeEvent<Tables.FringeRow, Model.Fringe>;

  return (state: S = initialState, action: A) => {
    let newState: S = genericReducer(state, action);

    // When an Account's underlying subaccounts are removed, updated or added,
    // or the Fringes are changed, we need to update/recalculate the Account.
    if (action.type === mappings.TableChanged || action.type === mappings.Fringes.TableChanged) {
      const e: GenericEvent = action.payload;
      if (action.type === mappings.Fringes.TableChanged) {
        /*
        Since the Fringes are displayed in a modal and not on a separate page, when a Fringe is
        changed we need to recalculate the SubAcccount(s) that have that Fringe so they display
        estimated values that are consistent with the change to the Fringe.
        */
        const fringeEvent = e as FringeEvent;
        // There are no group related events for the Fringe Table, but we have to assert this with
        // a typeguard to make TS happy.
        if (!tabling.typeguards.isGroupEvent(fringeEvent)) {
          const recalculateSubAccountsWithFringes = (ids: number[], removeFringes?: boolean): S => {
            /*
            For each Fringe that changed, we have to look at the SubAccount(s) that have that Fringe
            applied and recalculate the metrics for that SubAccount.

            Note that we have to recalculate the SubAccount metrics in entirety, instead of just
            refringing the SubAccount estimated value.  This is because the current estimated value
            on the SubAccount already has fringes applied, and we cannot refringe and already
            fringed value without knowing what the previous Fringe(s) were.
            */
            return reduce(
              uniq(
                map(
                  flatten(
                    map(ids, (id: number) => filter(newState.data, (subaccount: M) => includes(subaccount.fringes, id)))
                  ),
                  (subaccount: M) => subaccount.id
                )
              ),
              (s: S, id: number): S => {
                let subAccount = redux.reducers.modelFromState<M>(action, s.data, id);
                if (!isNil(subAccount)) {
                  subAccount = recalculateSubAccountMetrics<M, S, A>(s, action, subAccount) as M;
                  if (removeFringes === true) {
                    subAccount = {
                      ...subAccount,
                      fringes: filter(subAccount.fringes, (fringeId: number) => fringeId !== id)
                    };
                  }
                  return {
                    ...s,
                    data: util.replaceInArray<M>(s.data, { id: subAccount.id }, subAccount)
                  };
                }
                return s;
              },
              newState
            );
          };
          // There are no group related events for the Fringe Table, but we have to assert this with
          // a typeguard to make TS happy.
          if (tabling.typeguards.isDataChangeEvent(fringeEvent)) {
            /*
            For each Fringe change that occured, obtain the ID of the Fringe for only the changes
            that warrant recalculation of the SubAccount, and then recalculate the metrics for each
            SubAccount(s) that has that Fringe applied.

            We do not have to be concerned with the individual changes for each Fringe, since the
            actual changes will have already been applied to the Fringe(s) in the Fringe reducer.
            We only are concerned with the IDs of the Fringe(s) that changed, because we need those
            to determine what SubAccount(s) need to be updated (as a result of the change to the
            Fringe).
            */
            const consolidated = tabling.util.consolidateTableChange(fringeEvent.payload);
            newState = recalculateSubAccountsWithFringes(
              uniq(
                map(
                  /*
                  We only want to look at the changes to Fringe(s) that warrant recalculation of
                  the SubAccount.  The event will only warrant recalculation if either the
                  rate field or the cutoff field are changed (at least currently).
                  */
                  filter(consolidated, (ch: Table.RowChange<Tables.FringeRow, Model.Fringe>) =>
                    tabling.util.changeWarrantsRecalculation(ch)
                  ),
                  (change: Table.RowChange<Tables.FringeRow, Model.Fringe>) => change.id
                )
              )
            );
          } else if (tabling.typeguards.isRowAddEvent(fringeEvent)) {
            // Eventually, we will want to implement this - so we do not have to rely on waiting
            // for the response of the API request.
          } else if (tabling.typeguards.isRowDeleteEvent(fringeEvent)) {
            /*
            For each FringeRow that was removed, obtain the ID of the Fringe for only the removed rows
            that warrant recalculation of the SubAccount, and then recalculate the metrics for each
            SubAccount(s) that previously had that Fringe applied (while also removing the Fringe
            from that SubAccount).
            */
            const rows: Tables.FringeRow[] = Array.isArray(fringeEvent.payload.rows)
              ? fringeEvent.payload.rows
              : [fringeEvent.payload.rows];
            newState = recalculateSubAccountsWithFringes(
              uniq(
                map(
                  /*
                  We only want to look at the FringeRow(s) being deleted that would otherwise warrant
                  recalculation of the SubAccount.  The row will only warrant recalculation of the
                  SubAccount if the rate field or the cutoff field are changed (at least currently).
                  */
                  filter(rows, (row: Tables.FringeRow) =>
                    tabling.util.rowWarrantsRecalculation(row, fringeEvent.payload.columns)
                  ),
                  (row: Tables.FringeRow) => row.id
                )
              ),
              true
            );
          }
        }
      }
    }
    return newState;
  };
};
