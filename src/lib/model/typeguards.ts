export const isMarkup = (m: Model.HttpModel): m is Model.Markup => (m as Model.Markup).type === "markup";

export const isFlatMarkup = (
  m: Omit<Partial<Model.Markup>, "unit"> & Pick<Model.Markup, "unit">
): m is Model.FlatMarkup => (m as Model.FlatMarkup).unit.id === 1;

export const isPercentMarkup = (
  m: Omit<Partial<Model.Markup>, "unit"> & Pick<Model.Markup, "unit">
): m is Model.PercentMarkup => (m as Model.PercentMarkup).unit.id === 0;

export const isFringe = (m: Model.HttpModel): m is Model.Fringe => (m as Model.Fringe).type === "fringe";

export const isGroup = (m: Model.HttpModel): m is Model.Group => (m as Model.Group).type === "group";

export const isAccount = <M extends Model.Account | Model.SimpleAccount = Model.Account | Model.SimpleAccount>(
  m: Model.HttpModel
): m is M => (m as M).type === "account";

/* eslint-disable indent */
export const isSubAccount = <
  M extends Model.SubAccount | Model.SimpleSubAccount = Model.SubAccount | Model.SimpleSubAccount
>(
  m: Model.HttpModel
): m is M => (m as M).type === "subaccount";

export const isPdfAccount = (m: Model.HttpModel): m is Model.PdfAccount =>
  (m as Model.PdfAccount).type === "pdf-account";

export const isPdfSubAccount = (m: Model.HttpModel): m is Model.PdfSubAccount =>
  (m as Model.PdfSubAccount).type === "pdf-subaccount";

export const isPdfBudget = (m: Model.HttpModel): m is Model.PdfBudget => (m as Model.PdfBudget).type === "pdf-budget";

export const isBudget = <M extends Model.Budget | Model.SimpleBudget = Model.Budget | Model.SimpleBudget>(
  m: Model.HttpModel
): m is M => (m as M).type === "budget";

export const isTemplate = <M extends Model.Template | Model.SimpleTemplate = Model.Template | Model.SimpleTemplate>(
  m: Model.HttpModel
): m is M => (m as M).type === "template";

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

export const isModelWithColor = (model: Model.Model | Model.ModelWithColor): model is Model.ModelWithColor => {
  return (model as Model.ModelWithColor).color !== undefined;
};

export const isModelWithName = (model: Model.Model | Model.ModelWithName): model is Model.ModelWithName => {
  return (model as Model.ModelWithName).name !== undefined;
};

export const isModelWithDescription = (
  model: Model.Model | Model.ModelWithDescription
): model is Model.ModelWithDescription => {
  return (model as Model.ModelWithDescription).description !== undefined;
};

export const isModelWithIdentifier = (
  model: Model.Model | Model.ModelWithIdentifier
): model is Model.ModelWithIdentifier => {
  return (model as Model.ModelWithIdentifier).identifier !== undefined;
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
