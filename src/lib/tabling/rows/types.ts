import { RowClassParams } from "ag-grid-community";

import * as model from "../../model";
import * as ui from "../../ui";
import { enumeratedLiterals, EnumeratedLiteralType } from "../../util";
import { FooterGridId, ClassName } from "../types";

export type EditRowActionBehavior = "expand" | "edit";

export type GetRowStyle<R extends Row<BodyRowType> = Row<BodyRowType>> = (
  params: RowClassParams<R>,
) => ui.Style | null | undefined;

export type RowClassName<R extends Row<BodyRowType> = Row<BodyRowType>> = ClassName<
  RowClassParams<R>
>;

export type GetRowClassName<R extends Row<BodyRowType> = Row<BodyRowType>> = (
  params: RowClassParams<R>,
) => RowClassName<R>;

export interface RowColorDef {
  readonly backgroundColor?: string;
  readonly color?: string;
}

export const DataRowTypes = enumeratedLiterals(["placeholder", "model"] as const);
export type DataRowType = EnumeratedLiteralType<typeof DataRowTypes>;

export const BodyRowTypes = enumeratedLiterals([
  ...DataRowTypes.__ALL__,
  "markup",
  "group",
] as const);
export type BodyRowType = EnumeratedLiteralType<typeof BodyRowTypes>;

export const RowTypes = enumeratedLiterals([...BodyRowTypes.__ALL__, "page", "footer"] as const);
export type RowType = EnumeratedLiteralType<typeof RowTypes>;

export const EditableRowTypes = enumeratedLiterals([RowTypes.MARKUP, RowTypes.MODEL] as const);
export type EditableRowType = EnumeratedLiteralType<typeof EditableRowTypes>;

export const ExpandedRowTypes = enumeratedLiterals([
  ...RowTypes.__ALL__,
  "body",
  "data",
  "editable",
] as const);
export type ExpandedRowType = EnumeratedLiteralType<typeof ExpandedRowTypes>;

export type ModelRowId = number;
export type FooterRowId<T extends FooterGridId> = `footer-${T}`;
export type PlaceholderRowId = `placeholder-${number}`;
export type GroupRowId = `group-${number}`;
export type MarkupRowId = `markup-${number}`;

export type NonPlaceholderBodyRowId = RowId<EditableRowType | "group">;

export type RowId<T extends ExpandedRowType = ExpandedRowType> = T extends ExpandedRowType
  ? {
      markup: MarkupRowId;
      group: GroupRowId;
      placeholder: PlaceholderRowId;
      model: ModelRowId;
      footer: FooterRowId<"footer">;
      page: FooterRowId<"page">;
      data: RowId<DataRowType>;
      editable: RowId<EditableRowType>;
      body: RowId<BodyRowType>;
    }[T]
  : never;

export type RowGridId<T extends RowType = RowType> = T extends RowType
  ? {
      markup: "data";
      group: "data";
      placeholder: "data";
      model: "data";
      footer: "footer";
      page: "page";
    }[T]
  : never;

type BaseRow<T extends RowType = RowType> = T extends RowType
  ? {
      readonly id: RowId<T>;
      readonly gridId: RowGridId<T>;
      readonly rowType: T;
    }
  : never;

export type ModelRow<D extends RowData = RowData> = BaseRow<"model"> & {
  readonly children: number[];
  readonly order: string;
  // This field is primarily used for logging purposes.
  readonly modelType: model.RowHttpModelType;
  readonly data: D;
};

export type MarkupRow = BaseRow<"markup"> & {
  readonly children: number[];
  readonly data: model.Markup;
};

export type GroupRow = BaseRow<"group"> & {
  readonly children: number[];
  readonly data: model.Group;
};

export type PlaceholderRow<D extends RowData = RowData> = BaseRow<"placeholder"> & {
  readonly children: number[];
  readonly data: D;
};

export type FooterRow = BaseRow<"footer">;
export type PageRow = BaseRow<"page">;

export type RowData<R extends Row | undefined = undefined> = R extends undefined
  ? Record<string, unknown>
  : R extends { _dataType: infer D }
  ? D
  : never;

type _ReconstructRow<T extends Row, D extends RowType> = T extends {
  _dataType: infer Di extends RowData;
}
  ? _Row<D, Di>
  : never;

type PhantomRowType<Type, Data> = { _dataType: Type } & Data;

type _Row<
  T extends RowType = RowType,
  D extends Record<string, unknown> = Record<string, unknown>,
> = T extends RowType
  ? {
      model: PhantomRowType<D, ModelRow<D>>;
      markup: PhantomRowType<D, MarkupRow>;
      group: PhantomRowType<D, GroupRow>;
      placeholder: PhantomRowType<D, PlaceholderRow<D>>;
      footer: PhantomRowType<D, FooterRow>;
      page: PhantomRowType<D, PageRow>;
    }[T]
  : never;

export type Row<
  T extends RowType | Record<string, unknown> | Row | "__NEVER__" = "__NEVER__",
  D extends RowType | Record<string, unknown> | "__NEVER__" = "__NEVER__",
> = T extends "__NEVER__"
  ? D extends "__NEVER__"
    ? _Row
    : never
  : T extends RowType
  ? D extends Record<string, unknown>
    ? _Row<T, D>
    : _Row<T, Record<string, unknown>>
  : T extends Row
  ? D extends RowType
    ? _ReconstructRow<T, D>
    : never
  : T extends Record<string, unknown>
  ? Row<RowType, T>
  : never;

export type RowNameLabelType = number | string | null;

export type RowStringGetter<R extends Row> =
  | RowNameLabelType
  | FnWithTypedArgs<RowNameLabelType, [R]>;

export type RowWithColor<D extends RowData> = Row<"model", D & { color: ui.HexColor | null }>;

export type RowWithName<D extends RowData> = Row<"model", D & { name: string | null }>;

export type RowWithDescription<D extends RowData> =
  | Row<"model", D & { description: string | null }>
  | Row<"markup", D>;

export type RowWithIdentifier<D extends RowData> =
  | Row<"model", D & { identifier: string | null }>
  | Row<"markup", D>;
