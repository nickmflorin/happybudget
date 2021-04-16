/// <reference path="./modeling.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Table {
  interface CellError {
    readonly id: number;
    readonly field: string;
    readonly error: string;
  }

  type RowType = "subaccount" | "account" | "fringe" | "actual";

  interface RowMeta {
    readonly selected: boolean;
    readonly errors: Table.CellError[];
    readonly isPlaceholder?: boolean;
    readonly isGroupFooter?: boolean;
    readonly isTableFooter?: boolean;
    readonly isBudgetFooter?: boolean;
    readonly children: number[];
    readonly label: string;
    readonly typeLabel: string;
    readonly fieldsLoading: string[];
    readonly type: Table.RowType;
  }

  interface PageAndSize {
    readonly page: number;
    readonly pageSize: number;
  }

  interface Row<G extends Model.Group = Model.Group> {
    readonly id: number;
    readonly meta: RowMeta;
    readonly group: G | null;
  }

  interface CellChange<V> {
    oldValue: V;
    newValue: V;
  }

  type RowChangeData<R extends Table.Row> = { [key in keyof R]?: Table.CellChange<R[key]> };

  type RowChange<R extends Table.Row> = {
    id: number;
    data: Table.RowChangeData<R>;
  };

  interface ActivatePlaceholderPayload<M> {
    readonly id: number;
    readonly model: M;
  }

  interface BudgetAccountRow extends Table.Row<Model.BudgetGroup> {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly actual: number | null;
  }

  interface TemplateAccountRow extends Table.Row<Model.TemplateGroup> {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
  }

  interface SubAccountRow<G extends Model.Group> extends Table.Row<G> {
    readonly identifier: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Model.SubAccountUnitName | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly estimated: number | null;
    readonly fringes: number[];
  }

  interface BudgetSubAccountRow extends Table.SubAccountRow<Model.BudgetGroup> {
    readonly actual: number | null;
    readonly variance: number | null;
  }

  interface TemplateSubAccountRow extends Table.SubAccountRow<Model.TemplateGroup> {}

  interface FringeRow extends Table.Row<Model.Group> {
    readonly name: string | null;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number | null;
    readonly unit: Model.FringeUnitName;
  }

  interface ActualRow extends Table.Row<Model.BudgetGroup> {
    readonly object_id: number | null;
    readonly parent_type: Model.BudgetItemType | null;
    readonly description: string | null;
    readonly vendor: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_method: Model.PaymentMethodName | null;
    readonly payment_id: string | null;
    readonly value: string | null;
  }
}
