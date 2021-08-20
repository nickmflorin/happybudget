/// <reference path="./table.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Tables {
  interface AccountRow extends BudgetTable.Row {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    // Only defined for non-Template cases.
    readonly variance?: number | null;
    readonly actual?: number | null;
  }

  interface SubAccountRow extends BudgetTable.Row {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Model.Tag | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly estimated: number | null;
    readonly fringes: Model.Fringe[];
    // Only defined for non-Template cases.
    readonly contact?: number | null;
    readonly variance?: number | null;
    readonly actual?: number | null;
  }

  interface FringeRow extends Table.Row {
    readonly color: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number | null;
    readonly unit: Model.FringeUnit;
  }

  interface ActualRow extends Table.Row {
    readonly description: string | null;
    readonly vendor: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_method: Model.PaymentMethod | null;
    readonly subaccount: Model.SimpleAccount;
    readonly payment_id: string | null;
    readonly value: string | null;
  }

  interface PdfSubAccountRow extends Table.Row {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Model.Tag | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly estimated: number | null;
  }

  interface PdfAccountRow extends Table.Row {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly actual: number | null;
  }

  interface ContactRow extends Table.Row {
    readonly type: Model.ContactTypeName | null;
    readonly names_and_image: Model.ContactNamesAndImage;
    readonly company: string | null;
    readonly position: string | null;
    readonly phone_number: string | null;
    readonly email: string | null;
  }
}