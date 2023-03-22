import * as types from "./types";

export const modelIsTypedApiModel = <
  M extends types.TypedApiModel<TP>,
  TP extends types.ApiModelType = types.ApiModelType,
>(
  m: types.Model,
  t?: TP,
): m is M =>
  t !== undefined
    ? (m as M).type === t
    : (m as M).type !== undefined && types.ApiModelTypes.contains((m as M).type);

export const isModelWithColor = <M extends types.Model>(
  model: M | types.ModelWithColor<M>,
): model is types.ModelWithColor<M> => (model as types.ModelWithColor<M>).color !== undefined;

export const isModelWithName = <M extends types.Model>(
  model: M | types.ModelWithName<M>,
): model is types.ModelWithName<M> => (model as types.ModelWithName<M>).name !== undefined;

export const isModelWithDescription = <M extends types.Model>(
  model: M | types.ModelWithDescription<M>,
): model is types.ModelWithDescription<M> =>
  (model as types.ModelWithDescription<M>).description !== undefined;

export const isModelWithIdentifier = <M extends types.Model>(
  model: M | types.ModelWithIdentifier<M>,
): model is types.ModelWithIdentifier<M> =>
  (model as types.ModelWithIdentifier<M>).identifier !== undefined;
