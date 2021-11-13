export const isModelWithColor = (model: Model.Model | Model.ModelWithColor): model is Model.ModelWithColor =>
  (model as Model.ModelWithColor).color !== undefined;

export const isModelWithName = (model: Model.Model | Model.ModelWithName): model is Model.ModelWithName =>
  (model as Model.ModelWithName).name !== undefined;

export const isModelWithDescription = (
  model: Model.Model | Model.ModelWithDescription
): model is Model.ModelWithDescription => (model as Model.ModelWithDescription).description !== undefined;

export const isModelWithIdentifier = (
  model: Model.Model | Model.ModelWithIdentifier
): model is Model.ModelWithIdentifier => (model as Model.ModelWithIdentifier).identifier !== undefined;

export const isHttpModel = (m: Model.Model): m is Model.HttpModel => typeof m.id === "number";

export const isHttpModelWithType = (m: Model.Model): m is Model.GenericHttpModel<Model.HttpModelType> =>
  isHttpModel(m) && (m as Model.GenericHttpModel<Model.HttpModelType>).type !== undefined;

export const isTag = (model: Model.Model | Model.Tag): model is Model.Tag =>
  (model as Model.Tag).title !== undefined && (model as Model.Tag).color !== undefined;

export const isUploadParamsWithImage = (params: UploadImageParams): params is UploadImageParamsWithImage =>
  (params as UploadImageParamsWithImage).image !== undefined;

export const isUploadedImage = (params: UploadedImage | SavedImage): params is UploadedImage =>
  (params as UploadedImage).file !== undefined;
