import { Subtract } from "utility-types";

import * as ui from "../ui";
import { enumeratedLiterals, EnumeratedLiteralType } from "../util/literals";

export type ID = string | number;

/**
 * Used as the base representation for an entity that has an ID in the application.
 */
export type Model<I extends ID = ID> = { readonly id: I };

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ModelId<M> = M extends Model<infer I extends ID> ? I : never;

export const RowHttpModelTypes = enumeratedLiterals([
  "subaccount",
  "account",
  "fringe",
  "actual",
  "contact",
  "pdf-account",
  "pdf-subaccount",
] as const);

export type RowHttpModelType = EnumeratedLiteralType<typeof RowHttpModelTypes>;

export type RowTypedApiModel<TP extends RowHttpModelType = RowHttpModelType> = TypedApiModel<TP> & {
  readonly order: string;
};

export const ApiModelTagTypes = enumeratedLiterals(["subaccount-unit", "actual-type"] as const);
export type ApiModelTagType = EnumeratedLiteralType<typeof ApiModelTagTypes>;

export const ApiModelTypes = enumeratedLiterals([
  ...RowHttpModelTypes.__ALL__,
  ...ApiModelTagTypes.__ALL__,
  "collaborator",
  "markup",
  "group",
  "budget",
  "template",
  "pdf-budget",
] as const);

export type ApiModelType = EnumeratedLiteralType<typeof ApiModelTypes>;

/**
 * Represents a model that is returned from the HTTP API in JSON form.
 */
export type ApiModel = Model<number>;

/**
 * Represents a model that is returned from the HTTP API in JSON form that is attributed with a
 * specific type, {@link ApiModelType}.
 */
export type TypedApiModel<TP extends ApiModelType = ApiModelType> = ApiModel & {
  readonly type: TP;
};

export type AnyTypedApiModel = TypedApiModel<ApiModelType>;

export type BaseTypedApiModel = { readonly id: number; readonly type: ApiModelType };

export type InferTypedApiModelData<M> = M extends BaseTypedApiModel
  ? Subtract<M, BaseTypedApiModel>
  : never;

export type ModelWithColor<M extends Model> = M & { color: ui.HexColor | null };

export type ModelWithName<M extends Model> = M & { name: string | null };

export type ModelWithDescription<M extends Model> = M & { description: string | null };

export type ModelWithIdentifier<M extends Model> = M & { identifier: string | null };
