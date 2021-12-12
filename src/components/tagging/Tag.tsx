import React, { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { DEFAULT_COLOR_SCHEME, Colors } from "style/constants";
import { typeguards, util, tabling } from "lib";

const TagRenderer = <S extends object = React.CSSProperties>(params: ITagRenderParams<S>): JSX.Element => {
  const { contentRender, ...rest } = params;
  return (
    <div
      className={classNames(
        "tag",
        { uppercase: params.uppercase },
        { "fill-width": params.fillWidth },
        { disabled: params.disabled },
        params.className
      )}
      style={{ ...params.style, backgroundColor: params.color, color: params.textColor }}
      onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => !params.disabled && params.onClick?.(e)}
    >
      {!isNil(contentRender) ? (
        contentRender(rest)
      ) : (
        <span className={params.textClassName} style={params.textStyle}>
          {params.text}
        </span>
      )}
    </div>
  );
};

const Tag = <M extends Model.Model = Model.Model, S extends object = React.CSSProperties>(
  props: TagProps<M, S>
): JSX.Element => {
  const colorScheme = useMemo(() => {
    let tagColorScheme = DEFAULT_COLOR_SCHEME;
    if (!isNil(props.scheme)) {
      tagColorScheme = props.scheme;
    }
    return tagColorScheme;
  }, [props.scheme]);

  const tagText = useMemo((): string | M[keyof M] => {
    const getTextFromModel = (m: M): string | M[keyof M] => {
      if (!isNil(props.modelTextField)) {
        const modelTextFieldValue = util.getKeyValue<M, keyof M>(props.modelTextField)(m);
        if (!isNil(modelTextFieldValue) && typeof modelTextFieldValue !== "string") {
          console.error(`The field ${props.modelTextField} did not return a string.`);
          return "";
        }
        return modelTextFieldValue || "";
      } else if (!isNil(props.getModelText)) {
        const text = props.getModelText(m);
        if (!isNil(text)) {
          return text;
        }
        return "";
      }
      if (typeguards.isTag(m)) {
        if (props.isPlural === true && !isNil(m.plural_title)) {
          return m.plural_title;
        }
        return m.title;
      } else if (typeguards.isModelWithName(m)) {
        return m.name || "";
      } else if (tabling.typeguards.isRow(m) && tabling.typeguards.isRowWithName(m)) {
        return m.data.name || "";
      }
      return "";
    };
    if (props.isPlural === true && !isNil(props.pluralText)) {
      return props.pluralText;
    } else if (!isNil(props.text)) {
      return props.text;
    } else if (!isNil(props.children)) {
      if (typeof props.children === "string") {
        return props.children;
      }
      return getTextFromModel(props.children);
    } else if (!isNil(props.model)) {
      return getTextFromModel(props.model);
    }
    return "";
  }, [props]);

  const tagColor = useMemo((): Style.HexColor => {
    const validateAndReturnColor = (color: Style.HexColor | null | undefined, field: string): Style.HexColor => {
      if (isNil(color)) {
        return Colors.COLOR_NO_COLOR;
      } else if (typeof color !== "string") {
        console.error(`The field ${field} did not return a string color.`);
        return Colors.COLOR_NO_COLOR;
      }
      if (!color.startsWith("#")) {
        color = `#${color}`;
      }
      if (color.length !== 7) {
        console.error(`The field ${field} did not return a valid HEX string color.`);
        return Colors.COLOR_NO_COLOR;
      }
      return color;
    };
    const getColorFromModel = (m: M): Style.HexColor => {
      if (!isNil(props.modelColorField)) {
        const modelColorFieldValue: unknown = m[props.modelColorField];
        return validateAndReturnColor(modelColorFieldValue as Style.HexColor, props.modelColorField as string);
      } else if (!isNil(props.getModelColor)) {
        const color = props.getModelColor(m);
        if (!isNil(color)) {
          return validateAndReturnColor(color, "getModelColor callback");
        }
      }
      if (typeguards.isTag(m)) {
        return validateAndReturnColor(m.color, "color");
      } else if (typeguards.isModelWithColor(m)) {
        return validateAndReturnColor(m.color, "color");
      } else if (tabling.typeguards.isRow(m) && tabling.typeguards.isRowWithColor(m) && !isNil(m.data.color)) {
        return m.data.color;
      } else if (typeof m.id === "number" && !isNil(colorScheme[m.id])) {
        return colorScheme[m.id];
      }
      return Colors.COLOR_NO_COLOR;
    };
    if (!isNil(props.color)) {
      return validateAndReturnColor(props.color, "color");
    } else if (!isNil(props.children) && typeof props.children !== "string") {
      return getColorFromModel(props.children);
    } else if (!isNil(props.model)) {
      return getColorFromModel(props.model);
    } else if (!isNil(props.colorIndex)) {
      if (!isNil(colorScheme[props.colorIndex])) {
        return colorScheme[props.colorIndex];
      }
      return Colors.COLOR_NO_COLOR;
    }
    return util.selectConsistent(colorScheme, tagText as string);
  }, [props]);

  const tagTextColor = useMemo(() => {
    if (!isNil(props.textColor)) {
      return props.textColor;
    }
    return util.colors.contrastedForegroundColor(tagColor);
  }, [tagColor, props]);

  const renderParams = useMemo<ITagRenderParams<S>>(() => {
    return {
      className: props.className,
      uppercase: props.uppercase || false,
      color: tagColor,
      textColor: tagTextColor,
      text: tagText as string,
      fillWidth: props.fillWidth || false,
      style: props.style,
      textStyle: props.textStyle,
      textClassName: props.textClassName,
      contentRender: props.contentRender,
      onClick: props.onClick,
      disabled: props.disabled
    };
  }, [
    props.className,
    props.textClassName,
    props.style,
    props.textStyle,
    props.uppercase,
    tagColor,
    tagTextColor,
    tagText,
    props.fillWidth
  ]);

  if (!isNil(props.render)) {
    return props.render(renderParams);
  }
  return <TagRenderer<S> {...renderParams} />;
};

type MemoizedTagType = {
  <M extends Model.Model = Model.Model, S extends object = React.CSSProperties>(props: TagProps<M, S>): JSX.Element;
};

export default React.memo(Tag) as MemoizedTagType;
