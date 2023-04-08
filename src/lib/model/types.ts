import { Subtract } from "utility-types";

import { JsonObject } from "../schemas";
import * as ui from "../ui";
import { enumeratedLiterals, EnumeratedLiteralType } from "../util";

export type ID = string | number;

/**
 * Used as the base representation for an entity that has an ID in the application.
 */
export type Model<
  I extends ID = ID,
  T extends Record<string, unknown> | "__EMPTY__" = "__EMPTY__",
> = T extends "__EMPTY__"
  ? { readonly id: I }
  : T extends Record<string, unknown>
  ? { [key in "id" | keyof T]: key extends "id" ? I : key extends keyof T ? T[key] : never }
  : never;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ModelId<M> = M extends Model<infer I extends ID, any> ? I : never;

export type PartialModel<M extends Model> = Partial<Omit<M, "id">> & Pick<M, "id">;

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

export type RowTypedApiModel<
  TP extends RowHttpModelType = RowHttpModelType,
  T extends JsonObject = JsonObject,
> = TypedApiModel<
  TP,
  T & {
    readonly order: string;
  }
>;

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
export type ApiModel<T extends JsonObject | "__EMPTY__" = "__EMPTY__"> = Model<number, T>;

/**
 * Represents a model that is returned from the HTTP API in JSON form that is attributed with a
 * specific type, {@link ApiModelType}.
 */
export type TypedApiModel<
  TP extends ApiModelType = ApiModelType,
  T extends JsonObject | "__EMPTY__" = "__EMPTY__",
> = TP extends ApiModelType
  ? "__EMPTY__" extends T
    ? ApiModel<{ readonly type: TP }>
    : ApiModel<{ readonly type: TP } & T>
  : never;

export type AnyTypedApiModel<D extends JsonObject = JsonObject> = TypedApiModel<ApiModelType, D>;

export type BaseTypedApiModel = { readonly id: number; readonly type: ApiModelType };

export type InferTypedApiModelData<M> = M extends BaseTypedApiModel
  ? Subtract<M, BaseTypedApiModel>
  : never;

export type ModelWithColor<M extends Model> = M & { color: ui.HexColor | null };

export type ModelWithName<M extends Model> = M & { name: string | null };

export type ModelWithDescription<M extends Model> = M & { description: string | null };

export type ModelWithIdentifier<M extends Model> = M & { identifier: string | null };
