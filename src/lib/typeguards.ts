export const isModelWithColor = <M extends Model.HttpModel>(
  model: M | Model.ModelWithColor<M>
): model is Model.ModelWithColor<M> => (model as Model.ModelWithColor<M>).color !== undefined;

export const isModelWithName = <M extends Model.HttpModel>(
  model: M | Model.ModelWithName<M>
): model is Model.ModelWithName<M> => (model as Model.ModelWithName<M>).name !== undefined;

export const isModelWithDescription = <M extends Model.HttpModel>(
  model: M | Model.ModelWithDescription<M>
): model is Model.ModelWithDescription<M> => (model as Model.ModelWithDescription<M>).description !== undefined;

export const isModelWithIdentifier = <M extends Model.HttpModel>(
  model: M | Model.ModelWithIdentifier<M>
): model is Model.ModelWithIdentifier<M> => (model as Model.ModelWithIdentifier<M>).identifier !== undefined;

export const isHttpModel = (m: Model.Model): m is Model.HttpModel => typeof m.id === "number";

export const isHttpModelWithType = <
  M extends Model.Model,
  G extends Model.GenericHttpModel<T>,
  T extends Model.HttpModelType = Model.HttpModelType
>(
  m: M | G
): m is G => isHttpModel(m) && (m as G).type !== undefined;

export const isTag = (model: Model.Model | Model.Tag): model is Model.Tag =>
  (model as Model.Tag).title !== undefined && (model as Model.Tag).color !== undefined;

export const isUploadParamsWithImage = (params: UploadImageParams): params is UploadImageParamsWithImage =>
  (params as UploadImageParamsWithImage).image !== undefined;

export const isUploadedImage = (params: UploadedImage | SavedImage): params is UploadedImage =>
  (params as UploadedImage).file !== undefined;
