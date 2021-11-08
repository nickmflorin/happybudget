import { isNil, filter, find, map, forEach, reduce } from "lodash";
import { util, tabling } from "lib";
import { Colors } from "style/constants";
import * as models from "./models";

export const contactName = (contact: Model.Contact): string | null =>
  contact.contact_type?.id === models.ContactTypeModels.VENDOR.id ? contact.company : contact.full_name;

export const getGroupColorDefinition = (
  group: Style.HexColor | Model.Group | Table.GroupRow<any>
): Table.RowColorDef => {
  if (!isNil(group)) {
    let color =
      typeof group === "string" ? group : tabling.typeguards.isRow(group) ? group.groupData.color : group.color;
    if (!isNil(color)) {
      return {
        backgroundColor: color,
        color: util.colors.contrastedForegroundColor(color)
      };
    }
  }
  return {
    backgroundColor: Colors.DEFAULT_GROUP_ROW_BACKGROUND,
    color: util.colors.contrastedForegroundColor(Colors.DEFAULT_GROUP_ROW_BACKGROUND)
  };
};

export const findChoiceForName = <M extends Model.Choice<number, string>>(
  ms: M[],
  name: string,
  caseSensitive = true
): M | null => {
  return caseSensitive
    ? find(ms, { name } as any) || null
    : find(ms, (model: M) => model.name.toLowerCase() === name.toLowerCase()) || null;
};

export const findChoiceForId = <M extends Model.Choice<number, string>>(ms: M[], id: ID): M | null => {
  return find(ms, { id } as any) || null;
};

type InferModelFromNameParams<M extends Model.Model> = {
  readonly nameField?: keyof M;
  readonly strictUniqueness?: boolean;
  readonly ignoreBlank?: boolean;
};

/**
 * Given a set of models (M[]), tries to infer the model that corresponds to a given
 * string field value (referred to as Name in this case).  This method should be used
 * for inference only, when values may be fuzzy and/or corrupted (i.e. pasting
 * into a table). - it accounts for case insensitivity in the case that uniqueness is still
 *
 * The method accounts for case insensitivity by first determining if a unique result
 * can be determined from the case insensitive filter.  In the case that it cannot,
 * it tries the case sensitive filter.  If this still does not produce a single result,
 * it will either raise an Error or issue a warning and assume the first value.
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
  const ignoreBlank = !isNil(options.ignoreBlank) ? options.ignoreBlank : true;
  const nameField = !isNil(options.nameField) ? options.nameField : ("name" as keyof M);
  const strictUniqueness = !isNil(options.strictUniqueness) ? options.strictUniqueness : false;

  const performFilter = (caseSensitive: boolean): M[] => {
    return filter(ms, (m: M) => {
      const nameValue = util.getKeyValue<M, keyof M>(nameField)(m);
      if (!isNil(nameValue) && typeof nameValue === "string") {
        return caseSensitive === false
          ? String(nameValue).trim().toLocaleLowerCase() === String(value).trim().toLocaleLowerCase()
          : String(nameValue).trim() === String(value).trim().toLocaleLowerCase();
      }
      return false;
    });
  };

  if (value.trim() === "" && ignoreBlank) {
    return null;
  } else {
    const filtered = performFilter(false);
    if (filtered.length === 0) {
      // If there are no matches when case is insensitive, there will also be no
      // matches when case is sensitive.
      return null;
    } else if (filtered.length === 1) {
      return filtered[0];
    } else {
      // If there are multiple matches, we need to restrict base on case sensitivity.
      const msCaseSensitive = performFilter(true);
      if (msCaseSensitive.length === 0) {
        return null;
      } else if (msCaseSensitive.length === 1) {
        return msCaseSensitive[0];
      } else {
        if (strictUniqueness) {
          throw new Error(`Multiple models exist for field=${nameField} value=${value}.`);
        } else {
          console.warn(`Multiple models exist for field=${nameField} value=${value}.`);
          return msCaseSensitive[0];
        }
      }
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
  const names: any[] = ["", []];
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
  const split: string[] = value.split(",");
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
  id: ID,
  options: GetModelsByIdOptions = { throwOnMissing: false, warnOnMissing: true }
): M | null => {
  const model: M | undefined = find(ms, { id } as any);
  if (isNil(model)) {
    if (options.throwOnMissing === true) {
      throw new Error(`Cannot find ${options.modelName || "model"} with ID ${id} in provided models!`);
    } else if (options.warnOnMissing === true) {
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
