/// <reference path="../tabling/table.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Tables {
  interface AccountRowData {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number;
    readonly fringe_contribution: number;
    readonly markup_contribution: number;
    readonly actual: number;
  }
  type AccountRow = Table.Row<AccountRowData>;
  type AccountTableStore = Redux.BudgetTableStore<AccountRowData, Model.Account>;

  interface SubAccountRowData {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Model.Tag | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly fringes: number[];
    readonly contact?: number | null;
    readonly estimated: number;
    readonly fringe_contribution: number;
    readonly markup_contribution: number;
    readonly actual: number;
  }
  type SubAccountRow = Table.Row<SubAccountRowData>;
  type SubAccountTableStore = Redux.BudgetTableStore<SubAccountRowData, Model.SubAccount> & {
    readonly fringes: FringeTableStore;
    readonly subaccountUnits: Model.Tag[];
  };

  interface FringeRowData {
    readonly color: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number | null;
    readonly unit: Model.FringeUnit;
  }
  type FringeRow = Table.Row<FringeRowData>;
  type FringeTableStore = Redux.TableStore<FringeRowData, Model.Fringe> & {
    readonly fringeColors: string[];
  };

  interface ActualRowData {
    readonly description: string | null;
    readonly vendor: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_method: Model.PaymentMethod | null;
    readonly subaccount: Model.SimpleSubAccount;
    readonly payment_id: string | null;
    readonly value: number | null;
    readonly contact: number | null;
  }
  type ActualRow = Table.Row<ActualRowData>;
  type ActualTableStore = Redux.TableStore<ActualRowData, Model.Actual> & {
    readonly subAccountsTree: Redux.ModelListResponseStore<Model.SubAccountTreeNode>;
  };

  type PdfSubAccountRowData = {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Model.Tag | null;
    readonly multiplier: number | null;
    readonly rate: number | null;
    readonly estimated: number | null;
    readonly contact: number | null;
  };
  type PdfSubAccountRow = Table.Row<PdfSubAccountRowData>;

  type PdfAccountRowData = {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
    readonly variance: number | null;
    readonly actual: number | null;
  };
  type PdfAccountRow = Table.Row<PdfAccountRowData>;

  type ContactRowData = {
    readonly type: Model.ContactTypeName | null;
    readonly names_and_image: Model.ContactNamesAndImage;
    readonly company: string | null;
    readonly position: string | null;
    readonly phone_number: string | null;
    readonly email: string | null;
  };

  type ContactRow = Table.Row<ContactRowData>;
  type ContactTableStore = Redux.TableStore<ContactRowData, Model.Contact>;
}
