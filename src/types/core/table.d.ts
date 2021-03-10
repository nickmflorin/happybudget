/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Table {
  interface ICellError {
    id: number;
    field: string;
    error: string;
  }

  interface IRowMeta {
    selected: boolean;
    errors: ICellError[];
  }

  interface IRow<F extends string, E extends IRowMeta> {
    id: number;
    meta: E;
    [key in F]: any;
  }

  type RowType = "account" | "subaccount" | "actual";

  type AccountRowField = "account_number" | "description";
  type SubAccountRowField = "line" | "name" | "description" | "quantity" | "unit" | "multiplier" | "rate";
  type ActualRowField =
    | "parent"
    | "description"
    | "vendor"
    | "purchase_order"
    | "date"
    | "payment_method"
    | "payment_id"
    | "value";

  interface IBudgetRowMeta extends IRowMeta {
    readonly isPlaceholder: boolean;
    readonly subaccounts: ISimpleSubAccount[];
  }

  interface IActualRowMeta extends IRowMeta {
    readonly isPlaceholder: boolean;
  }

  interface IAccountRow extends IRow<AccountRowField, IBudgetRowMeta> {
    readonly account_number: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    readonly variance: number | null;
  }

  interface ISubAccountRow extends IRow<SubAccountRowField, IBudgetRowMeta> {
    readonly line: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Unit | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly estimated: number | null;
    readonly variance: number | null;
  }

  interface IActualRow extends IRow<ActualRowField, IActualRowMeta> {
    readonly parent: number | null;
    readonly description: string | null;
    readonly vendor: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_method: PaymentMethod | null;
    readonly payment_id: string | null;
    readonly value: string | null;
  }
}
