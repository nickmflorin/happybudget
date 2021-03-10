import initialState from "./initialState";
import rootReducer from "./reducer";
import rootSaga from "./sagas";

const Config: Redux.IModuleConfig<Redux.Budget.IStore, Redux.IAction<any>> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "budget"
};

export interface IFieldDefinition {
  name: string;
  payload?: boolean;
  required?: boolean;
  response?: boolean;
  triggerParentRefresh?: boolean;
}

export const FieldDefinitions: { [key in Table.RowType]: IFieldDefinition[] } = {
  actual: [
    { name: "description", payload: true },
    { name: "parent", payload: false, required: true },
    { name: "vendor", payload: true },
    { name: "purchase_order", payload: true },
    { name: "date", payload: true },
    { name: "payment_method", payload: true },
    { name: "payment_id", payload: true },
    { name: "value", payload: true }
  ],
  subaccount: [
    { name: "description", payload: true },
    { name: "name", payload: true, required: true },
    { name: "quantity", payload: true, triggerParentRefresh: true },
    { name: "rate", payload: true, triggerParentRefresh: true },
    { name: "multiplier", payload: true, triggerParentRefresh: true },
    { name: "unit", payload: true },
    { name: "line", payload: true, required: true },
    { name: "estimated", response: true }
  ],
  account: [
    { name: "description", payload: true },
    { name: "account_number", payload: true, required: true },
    { name: "estimated", response: true },
    { name: "variance", response: true },
    { name: "actual", response: true }
  ]
};

export default Config;
