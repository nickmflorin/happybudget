import { z } from "zod";

import * as model from "../../model";
import { GridIds } from "../types";

import * as types from "./types";

export const GroupRowIdSchema = z.custom<types.GroupRowId>(val =>
  /^group-([0-9]+)$/.test(val as string),
);

export const MarkupRowIdSchema = z.custom<types.MarkupRowId>(val =>
  /^markup-([0-9]+)$/.test(val as string),
);

export const PlaceholderRowIdSchema = z.custom<types.PlaceholderRowId>(val =>
  /^placeholder-([0-9]+)$/.test(val as string),
);

export const ModelRowIdSchema = z.number().int().min(1);
export const PageRowIdSchema = z.literal("footer-page");
export const FooterRowIdSchema = z.literal("footer-footer");

const BaseRowSchema = z.late.object(() => ({
  id: z.union([
    GroupRowIdSchema,
    MarkupRowIdSchema,
    PlaceholderRowIdSchema,
    z.literal("footer-footer"),
    z.literal("footer-page"),
    ModelRowIdSchema,
  ]),
  rowType: z.enum(types.RowTypes.__ALL__),
  gridId: z.enum(GridIds.__ALL__),
  __dataType__: z.object({}).nonstrict().passthrough(),
}));

export const PlaceholderRowSchema: z.ZodType<types.PlaceholderRow> = BaseRowSchema.extend({
  id: PlaceholderRowIdSchema,
  rowType: z.literal(types.RowTypes.PLACEHOLDER),
  gridId: z.literal(GridIds.DATA),
  children: z.array(z.number().int()),
  data: z.record(z.any()),
}).strict();

export const BaseModelRowSchema = BaseRowSchema.extend({
  id: ModelRowIdSchema,
  rowType: z.literal(types.RowTypes.MODEL),
  gridId: z.literal(GridIds.DATA),
  order: z.string().nonempty(),
  children: z.array(z.number().int()),
  modelType: z.enum(model.RowHttpModelTypes.__ALL__),
  data: z.record(z.any()),
}).strict();

export const ModelRowSchema: z.ZodType<types.ModelRow> = BaseModelRowSchema;

export const MarkupRowSchema: z.ZodType<types.MarkupRow> = BaseRowSchema.extend({
  id: MarkupRowIdSchema,
  rowType: z.literal(types.RowTypes.MARKUP),
  gridId: z.literal(GridIds.DATA),
  children: z.array(z.number().int()),
  data: model.MarkupSchema,
}).strict();

export const GroupRowSchema: z.ZodType<types.GroupRow> = BaseRowSchema.extend({
  id: GroupRowIdSchema,
  rowType: z.literal(types.RowTypes.GROUP),
  gridId: z.literal(GridIds.DATA),
  children: z.array(z.number().int()),
  data: model.GroupSchema,
}).strict();

export const PageRowSchema: z.ZodType<types.PageRow> = BaseRowSchema.extend({
  id: PageRowIdSchema,
  gridId: z.literal(GridIds.PAGE),
  rowType: z.literal(types.RowTypes.PAGE),
}).strict();

export const FooterRowSchema: z.ZodType<types.FooterRow> = BaseRowSchema.extend({
  id: FooterRowIdSchema,
  gridId: z.literal(GridIds.FOOTER),
  rowType: z.literal(types.RowTypes.FOOTER),
}).strict();

const ALL_ROW_SCHEMAS = [
  ModelRowSchema,
  PlaceholderRowSchema,
  MarkupRowSchema,
  GroupRowSchema,
  FooterRowSchema,
  PageRowSchema,
] as const;

export const RowSchema: z.ZodType<types.Row> = z.union(ALL_ROW_SCHEMAS);

const RowTypeSchemas: { [key in types.RowType]: z.ZodType<types.RowOfType<key>> } = {
  footer: FooterRowSchema,
  page: PageRowSchema,
  model: ModelRowSchema,
  placeholder: PlaceholderRowSchema,
  group: GroupRowSchema,
  markup: MarkupRowSchema,
};

export const getRowOfTypeSchema = <T extends types.RowType>(
  rowType: T,
): z.ZodType<types.RowOfType<T>> => RowTypeSchemas[rowType];
