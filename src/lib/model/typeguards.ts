export const isMarkup = (m: Model.HttpModel): m is Model.Markup => (m as Model.Markup).type === "markup";
export const isFringe = (m: Model.HttpModel): m is Model.Fringe => (m as Model.Fringe).type === "fringe";
export const isGroup = (m: Model.HttpModel): m is Model.Group => (m as Model.Group).type === "group";
export const isAccount = (m: Model.HttpModel): m is Model.Account => (m as Model.Account).type === "account";
export const isSubAccount = (m: Model.HttpModel): m is Model.SubAccount =>
  (m as Model.SubAccount).type === "subaccount";
export const isBudget = (m: Model.HttpModel): m is Model.Budget | Model.SimpleBudget =>
  (m as Model.Budget | Model.SimpleBudget).type === "budget";
export const isTemplate = (m: Model.HttpModel): m is Model.Template | Model.SimpleTemplate =>
  (m as Model.Template | Model.SimpleTemplate).type === "template";

export const isFieldAlterationEvent = (
  event: Model.FieldAlterationEvent | Model.CreateEvent
): event is Model.FieldAlterationEvent => {
  return (event as Model.FieldAlterationEvent).field !== undefined;
};

export const isModelWithChildren = <M extends Model.Model>(model: M): model is M & { children: M[] } => {
  return (
    (model as M & { children: M[] }).children !== undefined && Array.isArray((model as M & { children: M[] }).children)
  );
};

/* eslint-disable indent */
export const isModelWithGroup = <M extends Model.Model>(
  m: M | (M & { readonly group: Model.Group | null })
): m is M & { readonly group: Model.Group | null } =>
  (m as M & { readonly group: Model.Group | null }).group !== undefined;

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

export const isModelWithColor = (model: Model.Model | Model.ModelWithColor): model is Model.ModelWithColor => {
  return (model as Model.ModelWithColor).color !== undefined;
};

export const isModelWithName = (model: Model.Model | Model.ModelWithName): model is Model.ModelWithName => {
  return (model as Model.ModelWithName).name !== undefined;
};

export const isTag = (model: Model.Model | Model.Tag): model is Model.Tag => {
  return (model as Model.Tag).title !== undefined && (model as Model.Tag).color !== undefined;
};

export const isContact = (user: Model.User | Model.SimpleUser | Model.Contact): user is Model.Contact =>
  (user as Model.Contact).image !== undefined;

export const isUserWithImage = (user: Model.User | Model.SimpleUser | Model.Contact): user is Model.UserWithImage =>
  isContact(user)
    ? (user as Model.Contact).image !== null
    : (user as Model.User | Model.SimpleUser).profile_image !== null;

export const isUploadParamsWithImage = (params: UploadImageParams): params is UploadImageParamsWithImage => {
  return (params as UploadImageParamsWithImage).image !== undefined;
};

export const isUploadedImage = (params: UploadedImage | SavedImage): params is UploadedImage => {
  return (params as UploadedImage).file !== undefined;
};
