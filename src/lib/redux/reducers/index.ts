import { isNil, filter, find } from "lodash";
import { util, notifications } from "lib";

export * from "./factories";
export * from "./util";

export const modelListActionReducer: Redux.Reducer<
  Redux.ModelListActionStore,
  Redux.Action<Redux.ModelListActionPayload>
> = (
  st: Redux.ModelListActionStore = [],
  action: Redux.Action<Redux.ModelListActionPayload>
): Redux.ModelListActionStore => {
  if (action.payload.value === true) {
    const instance: Redux.ModelListActionInstance | undefined = find(st, { id: action.payload.id });
    if (!isNil(instance)) {
      return util.replaceInArray<Redux.ModelListActionInstance>(
        st,
        { id: action.payload.id },
        { ...instance, count: instance.count + 1 }
      );
    } else {
      return [...st, { id: action.payload.id, count: 1 }];
    }
  } else {
    const instance: Redux.ModelListActionInstance | undefined = find(st, { id: action.payload.id });
    if (isNil(instance)) {
      notifications.inconsistentStateError({
        action: "Removing from model list action state.",
        reason: "The instance does not exist in state when it is expected to."
      });
      return st;
    } else {
      if (instance.count === 1) {
        return filter(st, (inst: Redux.ModelListActionInstance) => inst.id !== action.payload.id);
      } else {
        return util.replaceInArray<Redux.ModelListActionInstance>(
          st,
          { id: action.payload.id },
          { ...instance, count: instance.count - 1 }
        );
      }
    }
  }
};
