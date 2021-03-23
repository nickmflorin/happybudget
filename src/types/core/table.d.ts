/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Table {
  interface CellError {
    readonly id: number;
    readonly field: string;
    readonly error: string;
  }

  interface RowChild {
    [key: string]: any;
  }

  interface RowMeta<C extends RowChild = RowChild> {
    readonly selected: boolean;
    readonly errors: CellError[];
    readonly isPlaceholder?: boolean;
    readonly isGroupFooter?: boolean;
    readonly children: C[];
  }

  interface RowGroup {
    readonly id: number;
    readonly name: string;
    readonly color: string;
  }

  interface PageAndSize {
    readonly page: number;
    readonly pageSize: number;
  }

  interface Row<G extends RowGroup = RowGroup, C extends RowChild = RowChild> {
    readonly id: number;
    readonly meta: RowMeta<C>;
    readonly group: G | null;
  }

  interface CellChange {
    oldValue: string | number | null;
    newValue: string | number;
  }

  type RowChange = {
    id: number;
    data: { [key: string]: CellChange };
  };

  interface IActivatePlaceholderPayload {
    readonly oldId: number;
    readonly id: number;
  }

  type RowType = "account" | "subaccount" | "actual";

  interface AccountRow extends Row<ISubAccountNestedGroup, ISimpleSubAccount> {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly actual: number | null;
  }

  interface SubAccountRow extends Row<ISubAccountNestedGroup, ISimpleSubAccount> {
    readonly identifier: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Unit | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly actual: number | null;
    readonly estimated: number | null;
    readonly variance: number | null;
  }

  interface ActualRow extends Row {
    readonly object_id: number | null;
    readonly parent_type: BudgetItemType | null;
    readonly description: string | null;
    readonly vendor: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_method: PaymentMethod | null;
    readonly payment_id: string | null;
    readonly value: string | null;
  }
}
