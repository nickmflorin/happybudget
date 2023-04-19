import { isNil } from "lodash";

import { tabling, util } from "lib";
import { DEFAULT_COLOR_SCHEME, Colors } from "deprecated/style/constants";

import * as typeguards from "./typeguards";

export const validatedColor = (color: Style.HexColor | null | undefined): Style.HexColor | null => {
  if (color === undefined) {
    return Colors.COLOR_NO_COLOR;
  } else if (color === null) {
    return null;
  } else if (typeof color !== "string") {
    console.error(`Invalid color ${String(color)} detected!`);
    return Colors.COLOR_NO_COLOR;
  } else {
    if (!color.startsWith("#")) {
      color = `#${color}`;
    }
    if (color.length !== 7) {
      console.error(`Invalid color ${color} detected!`);
      return Colors.COLOR_NO_COLOR;
    }
    return color;
  }
};

type GetModelColorOptions<M extends Model.Model> = {
  readonly modelColorField?: keyof M;
  readonly getModelColor?: (m: M) => Style.HexColor | null;
  readonly scheme?: Style.HexColor[];
};

export const getModelColor = <M extends Model.Model>(
  m: M,
  opts?: GetModelColorOptions<M>,
): Style.HexColor | null => {
  const modelColorField = opts?.modelColorField;
  const colorScheme = opts?.scheme || DEFAULT_COLOR_SCHEME;
  if (!isNil(modelColorField)) {
    /* First, if the modelColorField is defined, we try to obtain the Tag
			 color based on the value corresponding to this field on the model. */
    const modelColorFieldValue: unknown = m[modelColorField];
    return validatedColor(modelColorFieldValue as Style.HexColor);
  } else if (!isNil(opts?.getModelColor)) {
    /* Then, if the getModelColor callback is defined and returns a non-null
			 value, we will use the color defined by that callback. */
    const color = opts?.getModelColor(m);
    if (!isNil(color)) {
      return validatedColor(color);
    }
  }
  /* If the model itself has a `color` field, we should automatically use the
		 value associated with that field on the model unless the `modelColorField`
		 property is defined or the `getModelColor` property is defined.
		 field on the model. */
  if (typeguards.isModelWithColor(m)) {
    return validatedColor(m.color);
  } else if (tabling.rows.isRow(m) && tabling.rows.isRowWithColor(m) && !isNil(m.data.color)) {
    /* If the model is a Table.Row, and the row data defines a `color` field,
			 we should automatically use the value associated with that field in
			 the Table.RowData unless any of the above conditions have already been
			 met. */
    return m.data.color;
  } else if (typeof m.id === "number" && !isNil(colorScheme[m.id])) {
    /* Finally, if none of the above conditions are met, we should try to
			 use the defined or default color scheme to determine the color.  In
			 order for the color to be consistent across instances of the same
			 model, we make the selection from the color scheme based on the last
			 0-9 digit of the model's ID.  The result will always yield a value
			 unless the defined or default color scheme has less than 10 elements.
			 */
    const lastDigit = parseInt(String(m.id)[String(m.id).length - 1]);
    if (!isNil(colorScheme[lastDigit])) {
      return colorScheme[lastDigit];
    }
    return colorScheme[m.id];
  }
  /* As a last resort, if none of the conditions can be met, we simply use the
		 COLOR_NO_COLOR color, which is gray. */
  return Colors.COLOR_NO_COLOR;
};

type GetModelNameOptions<M extends Model.Model> = {
  readonly modelNameField?: keyof M;
  readonly getModelName?: (m: M) => string | null;
  readonly isPlural?: boolean;
};

export const getModelName = <M extends Model.Model>(
  m: M,
  opts?: GetModelNameOptions<M>,
): string => {
  const modelNameField = opts?.modelNameField;
  const getModelNameCb = opts?.getModelName;

  if (!isNil(modelNameField)) {
    const modelNameFieldValue = util.getKeyValue<M, keyof M>(modelNameField)(m);
    if (!isNil(modelNameFieldValue)) {
      if (typeof modelNameFieldValue !== "string") {
        console.error(`The field ${String(modelNameField)} did not return a string.`);
        return "";
      }
      return modelNameFieldValue;
    }
    return "";
  } else if (!isNil(getModelNameCb)) {
    return getModelNameCb(m) || "";
  } else if (typeguards.isTag(m)) {
    if (opts?.isPlural === true && !isNil(m.plural_title)) {
      return m.plural_title;
    }
    return m.title;
  } else if (typeguards.isModelWithName(m)) {
    return m.name || "";
  } else if (tabling.rows.isRow(m) && tabling.rows.isRowWithName(m)) {
    return m.data.name || "";
  }
  return "";
};
