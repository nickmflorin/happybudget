import { isNil, forEach, map, filter } from "lodash";
import { IFieldDefinition, FieldDefinitions } from "./config";

export const postPayload = <R>(row: R, type: Table.RowType): { [key: string]: any } => {
  const obj: { [key: string]: any } = {};
  forEach(FieldDefinitions[type], (def: IFieldDefinition) => {
    if (def.postPayload === true && !isNil(row[def.name as keyof R])) {
      obj[def.name] = row[def.name as keyof R];
    }
  });
  return obj;
};

export const payloadFromResponse = <M>(model: M, type: Table.RowType): { [key: string]: any } => {
  const obj: { [key: string]: any } = {};
  forEach(FieldDefinitions[type], (def: IFieldDefinition) => {
    if (def.responsePayload === true && def.updateBeforeResponse !== true) {
      obj[def.name] = model[def.name as keyof M];
    }
  });
  return obj;
};

export const patchPayload = (payload: Table.RowChange, type: Table.RowType): { [key: string]: any } => {
  const obj: { [key: string]: any } = {};
  forEach(FieldDefinitions[type], (def: IFieldDefinition) => {
    if (!isNil(payload.data[def.name])) {
      obj[def.name] = payload.data[def.name].newValue;
    }
  });
  return obj;
};

export const payloadBeforeResponse = (payload: Table.RowChange, type: Table.RowType): { [key: string]: any } => {
  const obj: { [key: string]: any } = {};
  forEach(FieldDefinitions[type], (def: IFieldDefinition) => {
    if (def.updateBeforeResponse === true && !isNil(payload.data[def.name])) {
      obj[def.name] = payload.data[def.name].newValue;
    }
  });
  return obj;
};

export const requestWarrantsParentRefresh = <P>(data: Partial<P>, type: Table.RowType): boolean => {
  let parentRefreshRequired = false;
  const fieldDefs = FieldDefinitions[type] as IFieldDefinition[];
  const fieldsTriggeringRefresh = map(
    filter(fieldDefs, (def: IFieldDefinition) => def.triggerParentRefresh === true),
    (def: IFieldDefinition) => def.name
  );
  forEach(fieldsTriggeringRefresh, (field: string) => {
    if (!isNil(data[field as keyof Partial<P>])) {
      parentRefreshRequired = true;
      return false;
    }
  });
  return parentRefreshRequired;
};

export const rowHasRequiredFields = <R extends { [key: string]: any }>(row: R, type: Table.RowType): boolean => {
  let requiredFieldsPresent = true;
  const fieldDefs = FieldDefinitions[type] as IFieldDefinition[];
  forEach(fieldDefs, (def: IFieldDefinition) => {
    if (def.requiredForPost === true) {
      const val = row[def.name];
      if (isNil(val) || val === "") {
        requiredFieldsPresent = false;
        return false;
      }
    }
  });
  return requiredFieldsPresent;
};
