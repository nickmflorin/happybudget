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

  interface Row<G extends Model.Group = Model.Group> extends Record<string, any> {
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

  interface AccountRow<G extends Model.Group> extends Table.Row<G> {
    readonly identifier: string | null;
    readonly description: string | null;
    readonly estimated: number | null;
  }

  interface BudgetAccountRow extends Table.AccountRow<Model.BudgetGroup> {
    readonly variance: number | null;
    readonly actual: number | null;
  }

  interface TemplateAccountRow extends Table.AccountRow<Model.TemplateGroup> {}

  interface SubAccountRow<G extends Model.Group> extends Table.Row<G> {
    readonly identifier: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly quantity: number | null;
    readonly unit: Model.Tag | null;
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
    readonly color: string | null;
    readonly name: string | null;
    readonly description: string | null;
    readonly cutoff: number | null;
    readonly rate: number | null;
    readonly unit: Model.FringeUnit;
  }

  interface ActualRow extends Table.Row<Model.BudgetGroup> {
    readonly description: string | null;
    readonly vendor: string | null;
    readonly purchase_order: string | null;
    readonly date: string | null;
    readonly payment_method: Model.PaymentMethod | null;
    readonly account: Model.SimpleAccount | Model.SimpleSubAccount;
    readonly payment_id: string | null;
    readonly value: string | null;
  }

  type IBaseField = {
    // Whether or not the field is required to be present for POST requests (i.e.
    // when creating a new instance).  If the field is required, the mechanics will
    // wait until a value is present for the field before creating an instance
    // via an HTTP POST request that is associated with the row (R).
    readonly required?: boolean;
    // The value that should be included for the field in the Placeholder row.
    readonly placeholderValue?: any;
  };

  type IReadField = Table.IBaseField & {
    readonly read: true;
    // Whether or not the model (M) field value should be used to construct the
    // row (R) model.
    readonly modelOnly?: boolean;
    // Whether or not the row (R) field should be used to update the model (M).
    readonly rowOnly?: boolean;
  };

  type IWriteField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>> = Table.IBaseField & {
    readonly write: true;
    // Whether or not the field value is allowed to take on null values for HTTP
    // requests.
    readonly allowNull?: boolean;
    // Whether or not the field value is allowed to take on empty string values for
    // HTTP requests.
    readonly allowBlank?: boolean;
    // The HTTP methods that the field should be used for.  Defaults to PATCH and
    // POST requests.
    readonly http?: Http.Method[];
    // Used to transform a value that is on the row (R) model to a value that is
    // included in the HTTP PATCH or POST payloads.
    readonly httpValueConverter?: (value: R[keyof R]) => P[keyof P] | undefined;
  };

  type IReadWriteField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>> = Table.IWriteField<
    R,
    M,
    P
  > &
    Table.IReadField;

  // Field configuration for Field that is included in HTTP requests to update or
  // create the instance but not on the model (M) or row (R).
  type IWriteOnlyField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>> = Table.IWriteField<
    R,
    M,
    P
  > & {
    readonly field: keyof P;
    readonly writeOnly: true;
    readonly getValueFromRowChangeData: (data: Table.RowChangeData<R>) => P[keyof P] | undefined;
    readonly getValueFromRow: (row: R) => P[keyof P] | undefined;
  };

  // Field configuration for Field that is not included in HTTP requests to update or
  // create the instance but present on the model (M) and row (R).
  type IReadOnlyField<R extends Table.Row, M extends Model.Model> = Table.IReadField & {
    readonly field: keyof M & keyof R;
    readonly readOnly: true;
  };

  type ISplitReadWriteField<
    R extends Table.Row,
    M extends Model.Model,
    P extends Http.ModelPayload<M>
  > = Table.IReadWriteField<R, M, P> & {
    // The name of the field on the model (M) model that the field configuration
    // corresponds to.
    readonly modelField: keyof M & keyof P;
    // The name of the field on the row (R) model that the field configuration
    // corresponds to.
    readonly rowField: keyof R;
  };

  type IAgnosticReadWriteField<
    R extends Table.Row,
    M extends Model.Model,
    P extends Http.ModelPayload<M>
  > = Table.IReadWriteField<R, M, P> & {
    // The name of the field on both the row (R) model and model (M) model that the
    // field configuration corresponds to.
    readonly field: keyof M & keyof R & keyof P;
  };

  type WriteableField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>> =
    | Table.SplitReadWriteField<R, M, P>
    | Table.AgnosticReadWriteField<R, M, P>
    | Table.WriteOnlyField<R, M, P>;

  type Field<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>> =
    | Table.WriteableField<R, M, P>
    | Table.ReadOnlyField<R, M>;

  interface IRowManager<
    R extends Table.Row<G>,
    M extends Model.Model,
    P extends Http.ModelPayload<M>,
    G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup
  > {
    readonly fields: Table.Field<R, M, P>[];
    readonly childrenGetter?: ((model: M) => number[]) | string | null;
    readonly groupGetter?: ((model: M) => number | null) | string | null;
    readonly typeLabel: string;
    readonly rowType: Table.RowType;
    readonly labelGetter: (model: M) => string;
  }

  const defaultRowMeta: Partial<Table.RowMeta> = {
    isPlaceholder: false,
    isGroupFooter: false,
    isTableFooter: false,
    isBudgetFooter: false,
    selected: false,
    children: [],
    errors: [],
    fieldsLoading: []
  };
}
