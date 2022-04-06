import React, { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { DEFAULT_COLOR_SCHEME, Colors } from "style/constants";
import { model, util, tabling } from "lib";
import { TooltipWrapper } from "components/tooltips";

const TagRenderer = <S extends React.CSSProperties | Pdf.Style = React.CSSProperties>({
  textColor,
  color,
  uppercase,
  fillWidth,
  disabled,
  contentRender,
  textClassName,
  textStyle,
  text,
  ...params
}: ITagRenderParams<S>): JSX.Element => {
  const style = useMemo(() => {
    const st = { ...params.style, color: textColor };
    if (color !== null) {
      return { ...st, backgroundColor: color };
    }
    return st;
  }, [params.style, color, textColor]);

  return (
    <div
      /* We must destruct the known props and spread the unknown props that are
         passed directly into the div because AntD's Tooltip component expects
				 that the child components excepts mouse related event handlers (like
         onMouseEnter, onMouseLeave, etc.). */
      {...params}
      className={classNames(
        "tag",
        { uppercase },
        { "fill-width": fillWidth },
        { disabled: disabled },
        params.className
      )}
      style={style as React.CSSProperties}
      onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => !disabled && params.onClick?.(e)}
    >
      {!isNil(contentRender) ? (
        contentRender({
          textColor,
          color,
          uppercase,
          fillWidth,
          disabled,
          textClassName,
          textStyle,
          text,
          ...params
        })
      ) : (
        <span className={textClassName} style={textStyle as React.CSSProperties}>
          {text}
        </span>
      )}
    </div>
  );
};

export const Tag = <
  M extends Model.Model = Model.Model,
  S extends React.CSSProperties | Pdf.Style = React.CSSProperties
>(
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
      if (model.isTag(m)) {
        if (props.isPlural === true && !isNil(m.plural_title)) {
          return m.plural_title;
        }
        return m.title;
      } else if (model.isModelWithName(m)) {
        return m.name || "";
      } else if (tabling.rows.isRow(m) && tabling.rows.isRowWithName(m)) {
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

  const tagColor = useMemo((): Style.HexColor | null => {
    const validateAndReturnColor = (color: Style.HexColor | null | undefined, field: string): Style.HexColor | null => {
      if (color === undefined) {
        return Colors.COLOR_NO_COLOR;
      } else if (color === null) {
        return null;
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
    const getColorFromModel = (m: M): Style.HexColor | null => {
      if (!isNil(props.modelColorField)) {
        const modelColorFieldValue: unknown = m[props.modelColorField];
        return validateAndReturnColor(modelColorFieldValue as Style.HexColor, props.modelColorField as string);
      } else if (!isNil(props.getModelColor)) {
        const color = props.getModelColor(m);
        if (!isNil(color)) {
          return validateAndReturnColor(color, "getModelColor callback");
        }
      }
      if (model.isTag(m)) {
        return validateAndReturnColor(m.color, "color");
      } else if (model.isModelWithColor(m)) {
        return validateAndReturnColor(m.color, "color");
      } else if (tabling.rows.isRow(m) && tabling.rows.isRowWithColor(m) && !isNil(m.data.color)) {
        return m.data.color;
      } else if (typeof m.id === "number" && !isNil(colorScheme[m.id])) {
        return colorScheme[m.id];
      }
      return Colors.COLOR_NO_COLOR;
    };

    if (props.color !== undefined) {
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
    /* The tagColor is null when we want the tag to be transparent, in which case
		   the secondary text color should be contrasted enough on the background. */
    return tagColor !== null ? util.colors.contrastedForegroundColor(tagColor) : Colors.TEXT_SECONDARY;
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
    return <TooltipWrapper tooltip={props.tooltip}>{props.render(renderParams)}</TooltipWrapper>;
  }
  return (
    <TooltipWrapper tooltip={props.tooltip}>
      <TagRenderer<S> {...renderParams} />
    </TooltipWrapper>
  );
};

export default React.memo(Tag) as typeof Tag;
