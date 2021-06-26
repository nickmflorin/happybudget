import { forEach, isNil, find, filter } from "lodash";
import { isRowChange, isSplitField, isWriteField, isWriteOnlyField } from "lib/model/typeguards/tabling";

const defaultRowMeta: Partial<Table.RowMeta> = {
  isGroupFooter: false,
  isTableFooter: false,
  isBudgetFooter: false,
  children: [],
  fieldsLoading: []
};

type PayloadType<T, P, R extends Table.Row> = T extends Table.RowChange<R> ? Partial<P> : P;

export class RowManager<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>
/* eslint-disable indent */
  implements Table.IRowManager<R, M, P>
{
  public fields: Table.Field<R, M, P>[];
  public childrenGetter?: ((model: M) => number[]) | string | null;
  public groupGetter?: ((model: M) => number | null) | string | null;
  public labelGetter: (model: M) => string;
  public typeLabel: string;
  public rowType: Table.RowType;

  constructor(config: Table.IRowManagerConfig<R, M, P>) {
    this.fields = config.fields;
    this.childrenGetter = config.childrenGetter;
    this.groupGetter = config.groupGetter;
    this.labelGetter = config.labelGetter;
    this.typeLabel = config.typeLabel;
    this.rowType = config.rowType;
  }

  public get requiredFields() {
    return filter(this.fields, (field: Table.Field<R, M, P>) => field.required === true);
  }

  public getField = (name: keyof R | keyof M): Table.Field<R, M, P> | null => {
    return (
      find(this.fields, (field: Table.Field<R, M, P>) => {
        if (isSplitField(field)) {
          return field.rowField === name;
        } else {
          return field.field === name;
        }
      }) || null
    );
  };

  public getChildren = (model: M): number[] => {
    if (typeof this.childrenGetter === "string") {
      const children: any = model[this.childrenGetter as keyof M];
      if (!isNil(children)) {
        return children;
      } else {
        /* eslint-disable no-console */
        console.warn(`Could not parse children from model based on model field ${this.childrenGetter}!`);
        return [];
      }
    } else if (!isNil(this.childrenGetter)) {
      return this.childrenGetter(model);
    } else {
      return [];
    }
  };

  public getGroup = (model: M): number | null => {
    if (this.groupGetter === null) {
      return null;
    } else if (typeof this.groupGetter === "string") {
      const group: any = model[this.groupGetter as keyof M];
      if (group !== undefined) {
        return group;
      } else {
        /* eslint-disable no-console */
        console.warn(`Could not parse group from model based on model field ${this.groupGetter}!`);
        return null;
      }
    } else if (!isNil(this.groupGetter)) {
      return this.groupGetter(model);
    } else {
      return null;
    }
  };

  public modelToRow = (model: M, meta: Partial<Table.RowMeta> = {}): R => {
    let obj: { [key in keyof R]?: R[key] } = {};
    obj = {
      ...obj,
      id: model.id,
      group: this.getGroup(model),
      meta: {
        ...defaultRowMeta,
        children: this.getChildren(model),
        label: this.labelGetter(model),
        typeLabel: this.typeLabel,
        type: this.rowType,
        ...meta
      }
    };
    forEach(this.fields, (field: Table.Field<R, M, P>) => {
      if (!isWriteOnlyField(field)) {
        if (field.modelOnly !== true) {
          const v = field.getValue(model) as R[keyof R];
          if (v !== undefined) {
            if (isSplitField(field)) {
              obj[field.rowField] = v;
            } else {
              obj[field.field] = v as R[keyof R & keyof M];
            }
          }
        }
      }
    });
    return obj as R;
  };

  public mergeChangesWithRow = (obj: R, change: Table.RowChange<R>): R => {
    const row: R = { ...obj };
    forEach(this.fields, (field: Table.Field<R, M, P>) => {
      if (!isWriteOnlyField(field)) {
        // We have to force coerce R[keyof R] to M[keyof M] because there is no way for TS to
        // understand that the model (M) field name is related to the row (R) field name via the
        // field configurations.
        const v = field.getValue(change) as R[keyof R] | R[keyof M & keyof R] | undefined;
        if (v !== undefined) {
          if (isSplitField(field)) {
            row[field.rowField] = v;
          } else {
            row[field.field] = v as R[keyof R & keyof M & keyof P];
          }
        }
      }
    });
    return row;
  };

  public mergeChangesWithModel = (obj: M, change: Table.RowChange<R>): M => {
    const model: M = { ...obj };
    forEach(this.fields, (field: Table.Field<R, M, P>) => {
      // We have to force coerce R[keyof R] to M[keyof M] because there is no way for TS to
      // understand that the model (M) field name is related to the row (R) field name via the
      // field configurations.
      if (!isWriteOnlyField(field) && !field.rowOnly) {
        const v = field.getValue(change);
        if (v !== undefined) {
          if (isSplitField(field)) {
            model[field.modelField] = v as M[keyof M & keyof P];
          } else {
            model[field.field] = v as M[keyof M & keyof R & keyof P];
          }
        }
      }
    });
    return model;
  };

  public payload = <T extends R | Table.RowChange<R> | Partial<R>>(row: T): PayloadType<T, P, R> => {
    /* eslint-disable no-unused-vars */
    const obj: { [key in keyof P]?: P[keyof P] } = {};
    const method: Http.Method = isRowChange(row) ? "PATCH" : "POST";

    const setValue = (field: Table.WriteableField<R, M, P>, key: keyof P, value: any): void => {
      if (value === null) {
        if (field.allowNull === true) {
          obj[key] = value;
        }
      } else if ((value as any) === "") {
        if (field.allowBlank === true) {
          obj[key] = "" as P[keyof P];
        }
      } else {
        obj[key] = value;
      }
    };
    forEach(this.fields, (field: Table.Field<R, M, P>) => {
      if (isWriteField(field)) {
        const httpValue = field.getHttpValue(row, method);
        if (httpValue !== undefined) {
          if (isSplitField(field)) {
            setValue(field, field.modelField, httpValue);
          } else {
            setValue(field, field.field, httpValue);
          }
        }
      }
    });
    return obj as PayloadType<T, P, R>;
  };
}
