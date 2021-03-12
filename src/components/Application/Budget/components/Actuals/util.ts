import { isNil } from "lodash";
import { generateRandomNumericId } from "../../util";

// export const postPayloadFromRow = <R, P>(row: R, type: Table.RowType): P => {
//   const obj: { [key: string]: any } = {};
//   forEach(FieldDefinitions[type], (def: IFieldDefinition) => {
//     if (def.postPayload === true && !isNil(row[def.name as keyof R])) {
//       obj[def.name] = row[def.name as keyof R];
//     }
//   });
//   return obj as P;
// };

export const initializeRowFromActual = (actual: IActual): Table.IActualRow => {
  return {
    id: actual.id,
    meta: {
      isPlaceholder: false,
      selected: false,
      errors: []
    },
    description: actual.description,
    vendor: actual.vendor,
    purchase_order: actual.purchase_order,
    date: actual.date,
    payment_id: actual.payment_id,
    value: actual.value,
    payment_method: actual.payment_method,
    object_id: actual.object_id,
    parent_type: actual.parent_type
  };
};

export const createActualRowPlaceholder = (): Table.IActualRow => ({
  id: generateRandomNumericId(),
  meta: {
    isPlaceholder: true,
    selected: false,
    errors: []
  },
  description: null,
  vendor: null,
  purchase_order: null,
  date: null,
  payment_id: null,
  value: null,
  payment_method: null,
  object_id: null,
  parent_type: null
});
