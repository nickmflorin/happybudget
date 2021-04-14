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

  interface RowMeta<C extends Model.Model = Model.Model> {
    readonly selected: boolean;
    readonly errors: Table.CellError[];
    readonly isPlaceholder?: boolean;
    readonly isGroupFooter?: boolean;
    readonly isTableFooter?: boolean;
    readonly isBudgetFooter?: boolean;
    readonly children: C[];
    readonly label: string;
    readonly typeLabel: string;
    readonly fieldsLoading: string[];
    readonly type: Table.RowType;
  }

  interface PageAndSize {
    readonly page: number;
    readonly pageSize: number;
  }

  interface Row<G extends Model.Group<any> = Group<any>, C extends Model.Model = Model.Model> {
    readonly id: number;
    readonly meta: RowMeta<C>;
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

  interface AccountRow extends Table.Row<Model.Group<Model.SimpleAccount>, Model.SimpleSubAccount> {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly actual: number | null;
  }

  interface SubAccountRow extends Table.Row<Model.Group<Model.SimpleSubAccount>, Model.SimpleSubAccount> {
    readonly identifier: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Model.SubAccountUnitName | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly actual: number | null;
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly fringes: number[];
  }

  interface FringeRow extends Table.Row<Model.Group<any>> {
    readonly name: string | null;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number | null;
    readonly unit: Model.FringeUnitName;
  }

  interface ActualRow extends Table.Row<Model.Group<any>> {
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
