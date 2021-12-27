import { find, filter, isNil, forEach, reduce, map } from "lodash";

import { isHttpModelWithType } from "./typeguards";

export enum ContactTypeNames {
  CONTRACTOR = "Contractor",
  EMPLOYEE = "Employee",
  VENDOR = "Vendor"
}

export const ContactTypeModels: { [key: string]: Model.ContactType } = {
  CONTRACTOR: { id: 0, name: ContactTypeNames.CONTRACTOR },
  EMPLOYEE: { id: 1, name: ContactTypeNames.EMPLOYEE },
  VENDOR: { id: 2, name: ContactTypeNames.VENDOR }
};

export const ContactTypes = Object.values(ContactTypeModels);

export const contactName = (contact: Model.Contact): string | null =>
  contact.contact_type?.id === ContactTypeModels.VENDOR.id ? contact.company : contact.full_name;

export const findChoiceForName = <M extends Model.Choice = Model.Choice>(
  ms: M[],
  name: string,
  caseSensitive = true
): M | null => {
  return caseSensitive
    ? (find(ms, { name }) as M | undefined) || null
    : (find(ms, (model: M) => model.name.toLowerCase() === name.toLowerCase()) as M | undefined) || null;
};

export const findChoiceForId = (ms: Model.Choice[], id: number): Model.Choice | null => {
  return find(ms, { id }) || null;
};

type InferModelFromNameParams<M extends Model.Model> = {
  readonly getName?: (m: M) => string | null | undefined;
  readonly reference?: string;
};

/**
 * Given a set of models (M[]), tries to infer the model that corresponds to a
 * given string field value (referred to as Name in this case).  This method
 * should be used for inference only, when values may be fuzzy and/or corrupted
 * (i.e. pasting into a table). - it accounts for case insensitivity in the case
 * that uniqueness is still
 *
 * The method accounts for case insensitivity by first determining if a unique
 * result can be determined from the case insensitive filter.  In the case that
 * it cannot, it tries the case sensitive filter.  If this still does not produce
 * a single result, it will either raise an Error or issue a warning and assume
 * the first value.
 *
 * @param models    M[]  List of models that should be filtered.
 * @param value          The value of the name field that we are searching for.
 * @param options   InferModelFromNameParams
 */
export const inferModelFromName = <M extends Model.Model>(
  ms: M[],
  value: string,
  options?: InferModelFromNameParams<M>
): M | null => {
  options = !isNil(options) ? options : {};
  const getName = options?.getName || ((m: M) => (m as M & { readonly name: string | null | undefined }).name);
  const reference = options?.reference || "model";

  const performFilter = (caseSensitive: boolean): M[] => {
    return filter(ms, (m: M) => {
      const nameValue = getName(m);
      if (!isNil(nameValue) && typeof nameValue === "string") {
        return caseSensitive === false
          ? String(nameValue).trim().toLocaleLowerCase() === String(value).trim().toLocaleLowerCase()
          : String(nameValue).trim() === String(value).trim().toLocaleLowerCase();
      }
      return false;
    });
  };

  const filtered = performFilter(false);
  if (filtered.length === 0) {
    /* If there are no matches when case is insensitive, there will also be no
       matches when case is sensitive. */
    return null;
  } else if (filtered.length === 1) {
    return filtered[0];
  } else {
    /* If there are multiple matches, we need to restrict base on case
       sensitivity. */
    const msCaseSensitive = performFilter(true);
    if (msCaseSensitive.length === 0) {
      return null;
    } else if (msCaseSensitive.length === 1) {
      return msCaseSensitive[0];
    } else {
      console.warn(`Multiple ${reference}s exist for name value=${value} - assuming the first.`);
      return msCaseSensitive[0];
    }
  }
};

/**
 * Safely parses a name into the first and last name, even in the case that
 * there are multiple name parts.
 *
 * For instance, if we have "Steven van Winkle" it will parse as
 * >>> ["Steven", "van Winkle"]
 *
 * @param name The name that should be parsed into first/last name components.
 */
export const parseFirstAndLastName = (name: string): [string | null, string | null] => {
  const parts = name.trim().split(" ");
  const names: [string, (string | null)[]] = ["", []];
  forEach(parts, (part: string) => {
    if (part !== "") {
      if (names[0] === "") {
        names[0] = part;
      } else {
        names[1].push(part);
      }
    }
  });
  if (names[1].length === 0) {
    return names[0].trim() === "" ? [null, null] : [names[0], null];
  }
  return [names[0].trim(), names[1].join(" ")];
};

export const parseIdsFromDeliminatedString = (value: string, delimiter = ","): number[] => {
  const split: string[] = value.split(delimiter);
  return reduce(
    split,
    (curr: number[], id: string) => {
      const trimmed = id.trim();
      if (!isNaN(parseInt(trimmed))) {
        return [...curr, parseInt(trimmed)];
      }
      return curr;
    },
    []
  );
};

type GetModelsByIdOptions = {
  readonly throwOnMissing?: boolean;
  readonly warnOnMissing?: boolean;
  readonly modelName?: string;
};

export const getModelById = <M extends Model.Model>(
  ms: M[],
  id: M["id"],
  options: GetModelsByIdOptions = { throwOnMissing: false, warnOnMissing: true }
): M | null => {
  options = {
    ...options,
    modelName:
      options.modelName !== undefined
        ? options.modelName
        : ms.length !== 0 && isHttpModelWithType(ms[0])
        ? ms[0].type
        : undefined
  };
  const model: M | undefined = find(ms, { id }) as M | undefined;
  if (isNil(model)) {
    if (options.throwOnMissing === true) {
      throw new Error(`Cannot find ${options.modelName || "model"} with ID ${id} in provided models!`);
    } else if (options.warnOnMissing !== false) {
      console.warn(`Cannot find ${options.modelName || "model"} with ID ${id} in provided models!`);
    }
    return null;
  } else {
    return model;
  }
};

export const getModelsByIds = <M extends Model.Model>(
  ms: M[],
  ids: ID[],
  options: GetModelsByIdOptions = { throwOnMissing: false, warnOnMissing: true }
): M[] => {
  return filter(
    map(ids, (id: ID) => getModelById(ms, id, options)),
    (m: M | null) => !isNil(m)
  ) as M[];
};
