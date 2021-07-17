export * from "./tabling";
export * from "./richtext";

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

export const isAccountForm = (obj: Model.Entity | Model.PdfEntity | Model.SimpleEntity): obj is Model.AccountForm => {
  return (obj as Model.AccountForm).type === "account";
};

export const isSubAccountForm = (
  obj: Model.Entity | Model.PdfEntity | Model.SimpleEntity
): obj is Model.SubAccountForm => {
  return (obj as Model.SubAccountForm).type === "subaccount";
};

export const isAccountOrSubAccountForm = (
  obj: Model.Entity | Model.PdfEntity | Model.SimpleEntity
): obj is Model.AccountForm | Model.SubAccountForm => {
  return isAccountForm(obj) || isSubAccountForm(obj);
};

export const isBudgetOrTemplateForm = (
  obj: Model.Entity | Model.SimpleEntity
): obj is Model.BudgetForm | Model.TemplateForm => {
  return isBudgetForm(obj) || isTemplateForm(obj);
};

export const isSubAccount = (obj: Model.Account | Model.SubAccount): obj is Model.SubAccount => {
  return (obj as Model.SubAccount).type === "subaccount";
};

export const isModelWithColor = (model: Model.M | Model.ModelWithColor): model is Model.ModelWithColor => {
  return (model as Model.ModelWithColor).color !== undefined;
};

export const isModelWithName = (model: Model.M | Model.ModelWithName): model is Model.ModelWithName => {
  return (model as Model.ModelWithName).name !== undefined;
};

export const isTag = (model: Model.M | Model.Tag): model is Model.Tag => {
  return (model as Model.Tag).title !== undefined && (model as Model.Tag).color !== undefined;
};

export const isContact = (user: Model.User | Model.SimpleUser | Model.Contact): user is Model.Contact =>
  (user as Model.Contact).image !== undefined;

export const isUserWithImage = (user: Model.User | Model.SimpleUser | Model.Contact): user is Model.UserWithImage =>
  isContact(user)
    ? (user as Model.Contact).image !== null
    : (user as Model.User | Model.SimpleUser).profile_image !== null;

export const isUploadParamsWithError = (params: UploadFileParams): params is UploadFileParamsWithError => {
  return (params as UploadFileParamsWithError).error !== undefined;
};

export const isUploadParamsWithData = (params: UploadFileParams): params is UploadFileParamsWithData => {
  return (params as UploadFileParamsWithData).data !== undefined;
};
