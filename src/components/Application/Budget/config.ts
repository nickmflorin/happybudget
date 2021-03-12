import initialState from "./initialState";
import rootReducer from "./reducer";
import rootSaga from "./sagas";

const Config: Redux.IModuleConfig<Redux.Budget.IStore, Redux.IAction<any>> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "budget"
};

export default Config;

export interface IFieldDefinition {
  name: string;
  postPayload?: boolean;
  requiredForPost?: boolean;
  responsePayload?: boolean;
  triggerParentRefresh?: boolean;
  updateBeforeResponse?: boolean;
}

export const FieldDefinitions: { [key in Table.RowType]: IFieldDefinition[] } = {
  actual: [
    { name: "description", postPayload: true },
    {
      name: "object_id",
      postPayload: false,
      requiredForPost: true,
      updateBeforeResponse: true,
      triggerParentRefresh: true
    },
    {
      name: "parent_type",
      postPayload: false,
      requiredForPost: true,
      updateBeforeResponse: true,
      triggerParentRefresh: true
    },
    { name: "vendor", postPayload: true },
    { name: "purchase_order", postPayload: true },
    { name: "date", postPayload: true },
    { name: "payment_method", postPayload: true },
    { name: "payment_id", postPayload: true },
    { name: "value", postPayload: true }
  ],
  subaccount: [
    { name: "description", postPayload: true },
    { name: "name", postPayload: true },
    { name: "quantity", postPayload: true, triggerParentRefresh: true },
    { name: "rate", postPayload: true, triggerParentRefresh: true },
    { name: "multiplier", postPayload: true, triggerParentRefresh: true },
    { name: "unit", postPayload: true, updateBeforeResponse: true },
    { name: "identifier", postPayload: true, requiredForPost: true },
    { name: "estimated", responsePayload: true }
  ],
  account: [
    { name: "description", postPayload: true },
    { name: "identifier", postPayload: true, requiredForPost: true },
    { name: "estimated", responsePayload: true },
    { name: "variance", responsePayload: true },
    { name: "actual", responsePayload: true }
  ]
};
