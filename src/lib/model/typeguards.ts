export const isFieldAlterationEvent = (
  event: Model.FieldAlterationEvent | Model.CreateEvent
): event is Model.FieldAlterationEvent => {
  return (event as Model.FieldAlterationEvent).field !== undefined;
};

export const isBudgetForm = (obj: Model.Entity | Model.SimpleEntity): obj is Model.BudgetForm => {
  return (obj as Model.BudgetForm).type === "budget";
};

export const isTemplateForm = (obj: Model.Entity | Model.SimpleEntity): obj is Model.TemplateForm => {
  return (obj as Model.TemplateForm).type === "template";
};

export const isAccountForm = (obj: Model.Entity | Model.SimpleEntity): obj is Model.AccountForm => {
  return (obj as Model.AccountForm).type === "account";
};

export const isSubAccountForm = (obj: Model.Entity | Model.SimpleEntity): obj is Model.SubAccountForm => {
  return (obj as Model.SubAccountForm).type === "subaccount";
};

export const isAccountOrSubAccountForm = (
  obj: Model.Entity | Model.SimpleEntity
): obj is Model.AccountForm | Model.SubAccountForm => {
  return isAccountForm(obj) || isSubAccountForm(obj);
};

export const isBudgetOrTemplateForm = (
  obj: Model.Entity | Model.SimpleEntity
): obj is Model.BudgetForm | Model.TemplateForm => {
  return isBudgetForm(obj) || isTemplateForm(obj);
};
