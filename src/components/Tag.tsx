import { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { DEFAULT_TAG_COLOR_SCHEME } from "config";
import { selectConsistent } from "lib/util";
import { contrastedForegroundColor } from "lib/util/colors";
import { isModelWithColor, isModelWithName } from "lib/model/typeguards";

import "./Tag.scss";

interface TagProps<M extends Model.Model = Model.Model> extends StandardComponentProps {
  children?: string;
  color?: string;
  scheme?: string[];
  uppercase?: boolean;
  colorIndex?: number;
  model?: M;
  modelTextField?: keyof M;
  modelColorField?: keyof M;
}

const Tag = <M extends Model.Model = Model.Model>({
  children,
  scheme,
  uppercase,
  color,
  model,
  modelTextField,
  modelColorField,
  colorIndex,
  className,
  style = {}
}: TagProps<M>): JSX.Element => {
  const colorScheme = useMemo(() => {
    let tagColorScheme = DEFAULT_TAG_COLOR_SCHEME;
    if (!isNil(scheme)) {
      tagColorScheme = scheme;
    }
    return tagColorScheme;
  }, [scheme]);
  const text = useMemo(() => {
    if (!isNil(children)) {
      return children;
    } else if (!isNil(model)) {
      if (!isNil(modelTextField) && !isNil(model[modelTextField])) {
        return model[modelTextField];
      } else if (isModelWithName(model)) {
        return model.name || "";
      } else {
        return "";
      }
    } else {
      return "";
    }
  }, [children, model]);

  const tagColor = useMemo(() => {
    if (!isNil(color)) {
      return color;
    } else if (!isNil(model)) {
      if (!isNil(modelColorField) && !isNil(model[modelColorField])) {
        return model[modelColorField];
      } else if (isModelWithColor(model)) {
        return model.color || "#EFEFEF";
      } else if (!isNil(colorIndex) && !isNil(colorScheme[colorIndex])) {
        return colorScheme[colorIndex];
      } else if (!isNil(colorScheme[model.id])) {
        return colorScheme[model.id];
      } else {
        return selectConsistent(colorScheme, text as string);
      }
    } else if (!isNil(colorIndex) && !isNil(colorScheme[colorIndex])) {
      return colorScheme[colorIndex];
    } else {
      return selectConsistent(colorScheme, text as string);
    }
  }, [colorScheme, color, text, colorIndex, model, modelColorField]);

  const textColor = useMemo(() => contrastedForegroundColor(tagColor as string), [tagColor]);

  return (
    <div
      className={classNames("tag", { uppercase }, className)}
      style={{ ...style, backgroundColor: tagColor as string, color: textColor }}
    >
      {text}
    </div>
  );
};

export default Tag;
