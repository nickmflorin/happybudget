/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Table {
  interface ICellError<F extends string> {
    id: number;
    field: F;
    error: string;
  }

  interface IRowMeta<F extends string, Y extends ICellError<F> = ICellError<F>> {
    selected: boolean;
    errors: Y[];
  }

  interface IRow<F extends string, E extends IRowMeta<F, Y>, Y extends ICellError<F> = ICellError<F>> {
    id: number;
    meta: E;
    [key in F]: any;
  }

  interface ICellUpdate<F extends string> {
    column: F;
    row: number;
    value: any;
  }

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

  interface IBudgetRowMeta<F extends string, Y extends ICellError<F> = ICellError<F>> extends IRowMeta<F, Y> {
    readonly isPlaceholder: boolean;
    readonly subaccounts: ISimpleSubAccount[];
  }

  interface IActualRowMeta<F extends string, Y extends ICellError<F> = ICellError<F>> extends IRowMeta<F, Y> {
    readonly isPlaceholder: boolean;
  }

  interface IAccountRow<Y extends ICellError<AccountRowField> = ICellError<AccountRowField>>
    extends IRow<AccountRowField, IBudgetRowMeta<AccountRowField, Y>> {
    readonly account_number: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    readonly variance: number | null;
  }

  interface ISubAccountRow<Y extends ICellError<SubAccountRowField> = ICellError<SubAccountRowField>>
    extends IRow<SubAccountRowField, IBudgetRowMeta<SubAccountRowField, Y>> {
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

  interface IActualRow<Y extends ICellError<ActualRowField> = ICellError<ActualRowField>>
    extends IRow<ActualRowField, IActualRowMeta<ActualRowField, Y>> {
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
