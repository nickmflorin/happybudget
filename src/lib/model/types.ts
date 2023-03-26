import * as ui from "../ui";
import { enumeratedLiterals, EnumeratedLiteralType } from "../util";

export type JsonValue =
  | JsonObject
  | JsonValue[]
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | null;

export type JsonObject = {
  [k: string]: JsonValue;
};

export type ID = string | number;

/**
 * Used as the base representation for an entity that has an ID in the application.
 */
export type Model<
  I extends ID = number,
  T extends Record<string, unknown> | undefined = undefined,
> = T extends undefined ? { readonly id: I } : { readonly id: I } & T;

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

export const ApiModelTypes = enumeratedLiterals([
  ...RowHttpModelTypes.__ALL__,
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
export type ApiModel<T extends JsonObject | undefined = undefined> = Model<number, T>;

/**
 * Represents a model that is returned from the HTTP API in JSON form that is attributed with a
 * specific type, {@link ApiModelType}.
 */
export type TypedApiModel<
  TP extends ApiModelType = ApiModelType,
  T extends JsonObject | undefined = undefined,
> = TP extends ApiModelType ? ApiModel<T & { readonly type: TP }> : never;

export type ModelWithColor<M extends Model> = M & { color: ui.HexColor | null };

export type ModelWithName<M extends Model> = M & { name: string | null };

export type ModelWithDescription<M extends Model> = M & { description: string | null };

export type ModelWithIdentifier<M extends Model> = M & { identifier: string | null };
