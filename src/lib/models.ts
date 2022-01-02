import { find, filter, isNil, forEach, reduce, map } from "lodash";

import { tabling } from "lib";
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

export const getRowGeneralReference = <R extends Table.RowData>(row: Table.Row<R>) => {
  if (tabling.typeguards.isModelRow(row)) {
    return `row (type = ${row.rowType}, modelType = ${row.modelType})`;
  }
  return `row (type = ${row.rowType})`;
};

export const getModelGeneralReference = <M extends Model.Model>(m: M): string => {
  return tabling.typeguards.isRow(m) ? getRowGeneralReference(m) : isHttpModelWithType(m) ? `${m.type}` : "model";
};

const getModelReferenceFn = <M extends Model.Model>(
  ms: M[],
  options?: Pick<Model.GetModelOptions<M>, "modelName">,
  m?: M | string | number
): string => {
  const mIsModel = (mi: M | string | number): mi is M => typeof m !== "string" && typeof m !== "number";

  const optionName =
    options?.modelName !== undefined ? options?.modelName : ms.length !== 0 ? getModelGeneralReference(ms[0]) : "model";

  return !isNil(m) ? `${optionName} ${mIsModel(m) ? m.id : m}` : optionName;
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
 * a single result, it will issue a warning and assume the first value.
 *
 * @param models    M[]  List of models that should be filtered.
 * @param value     The value of the name field that we are searching for.
 * @param options   InferModelFromNameParams
 */
export const inferModelFromName = <M extends Model.Model>(
  ms: M[],
  value: string,
  options?: Model.InferModelFromNameParams<M>
): M | null => {
  let undefinedNameWarningIssued = false;

  const getName = (m: M): string | null => {
    /* We do not want to flood Sentry with errors for each individual model in
		   the array if there is a configuration problem. */
    const warn = (msg: string) => {
      if (undefinedNameWarningIssued === false) {
        console.warn(msg);
        undefinedNameWarningIssued = true;
      }
    };
    if (!isNil(options?.getName)) {
      const name = options?.getName(m);
      if (name === undefined) {
        warn(
          `Cannot infer model ${getModelReferenceFn(ms, options, m)} from name ` +
            "because the callback 'getName' returned an undefined value."
        );
        return null;
      } else if (name === null || typeof name === "string") {
        return name;
      } else {
        warn(
          `Cannot infer model ${getModelReferenceFn(ms, options, m)} from name ` +
            "because the callback 'getName' returned a value of type " +
            `${typeof name} value, not string.`
        );
        return null;
      }
    } else {
      const name = (m as M & { readonly name: string | null }).name;
      if (name === undefined) {
        warn(
          `Cannot infer model ${getModelReferenceFn(ms, options, m)} from name ` +
            "because the 'name' attribute returned an undefined value."
        );
        return null;
      } else if (name === null || typeof name === "string") {
        return name;
      } else {
        warn(
          `Cannot infer model ${getModelReferenceFn(ms, options, m)} from name ` +
            "because the 'name' attribute returned a value of type " +
            `${typeof name} value, not string.`
        );
        return null;
      }
    }
  };

  const performFilter = (caseSensitive: boolean): M[] => {
    return filter(ms, (m: M) => {
      const nameValue = getName(m);
      if (!isNil(nameValue)) {
        return caseSensitive === false
          ? String(nameValue).trim().toLocaleLowerCase() === String(value).trim().toLocaleLowerCase()
          : String(nameValue).trim() === String(value).trim().toLocaleLowerCase();
      }
      return false;
    }) as M[];
  };

  const returnAndWarn = (m: M | null): M | null => {
    if (options?.warnOnMissing !== false && m === null) {
      console.warn(`Cannot infer ${getModelReferenceFn(ms, options)} from name ${value} in ` + "provided models!");
      return null;
    }
    return m;
  };

  const filtered = performFilter(false);
  if (filtered.length === 0) {
    /* If there are no matches when case is insensitive, there will also be no
       matches when case is sensitive. */
    return returnAndWarn(null);
  } else if (filtered.length === 1) {
    return returnAndWarn(filtered[0]);
  } else if (options?.caseInsensitive === false) {
    console.warn(`Multiple ${getModelReferenceFn(ms, options)}s exist for name - assuming the first.`);
    return returnAndWarn(filtered[0]);
  } else {
    /* If there are multiple matches, we need to restrict base on case
       sensitivity. */
    const msCaseSensitive = performFilter(true);
    if (msCaseSensitive.length === 0) {
      return returnAndWarn(null);
    } else if (msCaseSensitive.length === 1) {
      return returnAndWarn(msCaseSensitive[0]);
    } else {
      console.warn(`Multiple ${getModelReferenceFn(ms, options)}s exist for name - assuming the first.`);
      return returnAndWarn(msCaseSensitive[0]);
    }
  }
};

export const findChoiceForName = <M extends Model.Choice = Model.Choice>(
  ms: M[],
  name: string,
  options?: Omit<Model.InferModelFromNameParams<M>, "getName">
): M | null => {
  return inferModelFromName(ms, name, { caseInsensitive: false, ...options });
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

export const getModel = <M extends Model.Model>(
  ms: M[],
  id: Model.ModelLookup<M>,
  options?: Model.GetModelOptions<M>
): M | null => {
  const predicate = typeof id === "function" ? id : (m: M) => m.id === id;
  const model: M | undefined = find(ms, predicate) as M | undefined;
  if (isNil(model)) {
    if (!isNil(options?.onMissing) && options?.warnOnMissing !== false) {
      options?.onMissing({
        ref: getModelReferenceFn(ms, options, typeof id === "function" ? undefined : id),
        lookup: id
      });
    } else if (options?.warnOnMissing !== false) {
      console.warn(
        `Cannot find ${getModelReferenceFn(ms, options, typeof id === "function" ? undefined : id)} in provided models!`
      );
    }
    return null;
  } else {
    return model;
  }
};

export const findChoiceForId = (ms: Model.Choice[], id: number): Model.Choice | null =>
  getModel(ms, id, { warnOnMissing: true });

export const getModels = <M extends Model.Model>(
  ms: M[],
  ids: Model.ModelLookup<M>[],
  options?: Model.GetModelOptions<M>
): M[] => {
  return filter(
    map(ids, (id: Model.ModelLookup<M>) => getModel(ms, id, options)),
    (m: M | null) => !isNil(m)
  ) as M[];
};
