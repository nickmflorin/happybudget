import { isNil } from "lodash";

/**
 * A reducer factory that creates a generic reducer to handle the read only state
 * of a detail response, where a detail response might be the response received
 * from submitting an API request to /entity/<pk>.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createDetailResponseReducer =
  <
    M extends Model.HttpModel,
    S extends Redux.ModelDetailResponseStore<M> = Redux.ModelDetailResponseStore<M>,
    A extends Redux.Action = Redux.Action
  >(
    config: Redux.ReducerConfig<S, Redux.ModelDetailResponseActionMap<M>>
  ): Redux.Reducer<S, A> =>
  (state: S = config.initialState, action: A): S => {
    if (!isNil(config.actions.response) && action.type === config.actions.response.toString()) {
      return { ...state, data: action.payload };
    } else if (!isNil(config.actions.loading) && action.type === config.actions.loading.toString()) {
      return { ...state, loading: action.payload };
    } else if (!isNil(config.actions.updateInState) && action.type === config.actions.updateInState.toString()) {
      return { ...state, data: { ...state.data, ...action.payload.data } };
    }
    return state;
  };
