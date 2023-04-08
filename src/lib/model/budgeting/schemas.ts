import { z } from "zod";

import * as fs from "../../fs";
import * as ui from "../../ui";
import * as attachment from "../attachment";
import * as auth from "../auth";
import * as schemas from "../schemas";
import { ApiModelTypes } from "../types";
import * as user from "../user";

import * as types from "./types";

export const GroupSchema: z.ZodType<types.Group> = z.object({
  id: schemas.ModelNumbericIdSchema,
  type: z.literal(ApiModelTypes.GROUP),
  name: z.string().nonempty(),
  color: z.nullable(ui.HexColorSchema),
  children: z.array(schemas.ModelNumbericIdSchema),
});

export const MarkupUnitFlatSchema = z
  .object({
    id: z.literal(types.MarkupUnits.FLAT.id),
    name: z.literal(types.MarkupUnits.FLAT.name),
    slug: z.literal(types.MarkupUnits.FLAT.slug),
  })
  .strict();

export const MarkupUnitPercentSchema = z
  .object({
    id: z.literal(types.MarkupUnits.PERCENT.id),
    name: z.literal(types.MarkupUnits.PERCENT.name),
    slug: z.literal(types.MarkupUnits.PERCENT.slug),
  })
  .strict();

export const MarkupUnitSchema: z.ZodType<types.MarkupUnit> = z.union([
  MarkupUnitFlatSchema,
  MarkupUnitPercentSchema,
]);

const BaseMarkupSchema = z
  .object({
    id: schemas.ModelNumbericIdSchema,
    identifier: z.string().nullable(),
    type: z.literal(ApiModelTypes.MARKUP),
    description: z.string().nullable(),
    unit: MarkupUnitSchema,
    rate: z.number().positive().nullable(),
    actual: z.number().positive(),
  })
  .strict();

export const FlatMarkupSchema: z.ZodType<types.FlatMarkup> = BaseMarkupSchema.extend({
  unit: MarkupUnitFlatSchema,
}).strict();

export const PercentMarkupSchema: z.ZodType<types.PercentMarkup> = BaseMarkupSchema.extend({
  unit: MarkupUnitPercentSchema,
  children: z.array(z.number().positive()),
}).strict();

export const MarkupSchema: z.ZodType<types.Markup> = z.union([
  FlatMarkupSchema,
  PercentMarkupSchema,
]);

const AbstractBudgetSchemaObj = z
  .object({
    id: schemas.ModelNumbericIdSchema,
    type: z.literal(ApiModelTypes.BUDGET),
    name: z.string().nonempty(),
    domain: z.enum(types.BudgetDomains.__ALL__),
    updated_at: z.string().nonempty(),
    image: z.nullable(fs.SavedImageSchema),
    updated_by: z.nullable(user.SimpleUserSchemaObj.omit({ profile_image: true })),
  })
  .strict();

export const SimpleTemplateSchemaObj = AbstractBudgetSchemaObj.extend({
  domain: z.literal("template"),
  hidden: z.boolean().optional(),
}).strict();

export const SimpleTemplateSchema: z.ZodType<types.SimpleTemplate> = SimpleTemplateSchemaObj;

export const TemplateSchema: z.ZodType<types.Template> = SimpleTemplateSchemaObj.extend({
  nominal_value: z.union([z.number().int().positive(), z.literal(0)]),
  actual: z.union([z.number().int().positive(), z.literal(0)]),
  accumulated_fringe_contribution: z.union([z.number().int().positive(), z.literal(0)]),
  accumulated_markup_contribution: z.union([z.number().int().positive(), z.literal(0)]),
}).strict();

export const SimpleBudgetSchemaObj = AbstractBudgetSchemaObj.extend({
  domain: z.literal("budget"),
  is_permissioned: z.boolean(),
}).strict();

export const SimpleBudgetSchema: z.ZodType<types.SimpleBudget> = SimpleBudgetSchemaObj;

export const UserBudgetSchemaObj = SimpleBudgetSchemaObj.extend({
  public_token: z.nullable(auth.PublicTokenSchema),
  nominal_value: z.union([z.number().int().positive(), z.literal(0)]),
  actual: z.union([z.number().int().positive(), z.literal(0)]),
  accumulated_fringe_contribution: z.union([z.number().int().positive(), z.literal(0)]),
  accumulated_markup_contribution: z.union([z.number().int().positive(), z.literal(0)]),
}).strict();

export const UserBudgetSchema: z.ZodType<types.UserBudget> = UserBudgetSchemaObj;

export const AnotherUserBudgetSchema: z.ZodType<types.AnotherUserBudget> = UserBudgetSchemaObj.omit(
  { is_permissioned: true },
).strict();

export const BudgetSchema: z.ZodType<types.Budget> = z.union([
  UserBudgetSchema,
  AnotherUserBudgetSchema,
]);

/* We cannot use the factory 'createTypedApiModelSchema' because zod cannot properly handle string
   literal union types (domain field). */
export const SimpleAccountSchemaObj = z
  .object({
    type: z.literal(ApiModelTypes.ACCOUNT),
    id: schemas.ModelNumbericIdSchema,
    identifier: z.string().nullable(),
    description: z.string().nullable(),
    domain: z.enum(types.BudgetDomains.__ALL__),
  })
  .strict();

export const SimpleAccountSchema: z.ZodType<types.SimpleAccount> = SimpleAccountSchemaObj;

export const AccountSchemaObj = SimpleAccountSchemaObj.extend({
  nominal_value: z.union([z.number().int().positive(), z.literal(0)]),
  actual: z.union([z.number().int().positive(), z.literal(0)]),
  markup_contribution: z.union([z.number().int().positive(), z.literal(0)]),
  accumulated_fringe_contribution: z.union([z.number().int().positive(), z.literal(0)]),
  accumulated_markup_contribution: z.union([z.number().int().positive(), z.literal(0)]),
  order: z.string().nonempty(),
  children: z.array(schemas.ModelNumbericIdSchema),
  // Only included for detail endpoints.
  table: z.array(SimpleAccountSchema).optional(),
  // Only included for detail endpoints.
  ancestors: z
    .union([z.array(SimpleBudgetSchema).length(1), z.array(SimpleTemplateSchema).length(1)])
    // Coercion is necessary due to type limitations around tuples in zod.
    .optional() as z.ZodType<[types.SimpleBudget | types.SimpleTemplate] | undefined>,
}).strict();

export const AccountSchema: z.ZodType<types.Account> = AccountSchemaObj;

export const SubAccountUnitSchemaObj = schemas.createTypedApiModelSchema<
  Omit<types.SubAccountUnit, "color"> & { readonly color: string | null }
>(ApiModelTypes.SUBACCOUNT_UNIT, {
  order: z.number().int().positive(),
  // Coercion is necessary due to the lack of support of string literals in zod package.
  color: z.string().startsWith("#").length(7).nullable(),
  plural_title: z.string().nullable(),
  title: z.string(),
});

// Coercion is necessary due to the lack of support of string literals in zod package.
export const SubAccountUnitSchema: z.ZodType<types.SubAccountUnit> =
  SubAccountUnitSchemaObj as z.ZodType<types.SubAccountUnit>;

/* We cannot use the factory 'createTypedApiModelSchema' because zod cannot properly handle string
   literal union types (domain field). */
export const SimpleSubAccountSchemaObj = z
  .object({
    type: z.literal(ApiModelTypes.SUBACCOUNT),
    id: schemas.ModelNumbericIdSchema,
    identifier: z.string().nullable(),
    description: z.string().nullable(),
    domain: z.enum(types.BudgetDomains.__ALL__),
  })
  .strict();

export const SimpleSubAccountSchema: z.ZodType<types.SimpleSubAccount> = SimpleSubAccountSchemaObj;

export const SubAccountSchemaObj = SimpleSubAccountSchemaObj.extend({
  nominal_value: z.union([z.number().int().positive(), z.literal(0)]),
  actual: z.union([z.number().int().positive(), z.literal(0)]),
  markup_contribution: z.union([z.number().int().positive(), z.literal(0)]),
  fringe_contribution: z.union([z.number().int().positive(), z.literal(0)]),
  accumulated_fringe_contribution: z.union([z.number().int().positive(), z.literal(0)]),
  accumulated_markup_contribution: z.union([z.number().int().positive(), z.literal(0)]),
  order: z.string().nonempty(),
  rate: z.number().positive().nullable(),
  multiplier: z.number().positive().nullable(),
  quantity: z.number().positive().nullable(),
  object_id: schemas.ModelNumbericIdSchema,
  fringes: z.array(schemas.ModelNumbericIdSchema),
  children: z.array(schemas.ModelNumbericIdSchema),
  unit: z.nullable(SubAccountUnitSchema),
  // Only applicable for non-Template cases.
  contact: z.nullable(schemas.ModelNumbericIdSchema).optional(),
  parent_type: z.enum([types.ParentTypes.ACCOUNT, types.ParentTypes.SUBACCOUNT]),
  // Only included for detail endpoints.
  table: z.array(SimpleSubAccountSchema).optional(),
  attachments: z.array(attachment.SimpleAttachmentSchema).optional(),
  /* Only included for detail endpoints.  We cannot type this exactly as it is in the type, because
     there does not seem to be a way to handle array rest args in a TypeScript array definition. */
  ancestors: z
    .array(
      z.union([
        SimpleBudgetSchema,
        SimpleTemplateSchema,
        SimpleAccountSchema,
        SimpleSubAccountSchema,
      ]),
    )
    .min(2)
    // Coercion is necessary due to type limitations around tuples in zod.
    .optional() as z.ZodType<
    | [
        types.SimpleBudget | types.SimpleTemplate,
        Omit<types.SimpleAccount, "order">,
        ...Array<Omit<types.SimpleSubAccount, "order">>,
      ]
    | undefined
  >,
}).strict();

export const SubAccountSchema: z.ZodType<types.SubAccount> = SubAccountSchemaObj;
