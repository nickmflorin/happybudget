import React, { useMemo } from "react";

import classNames from "classnames";
import { isNil } from "lodash";

import { model, util } from "lib";
import { TooltipWrapper } from "components/tooltips";
import { DEFAULT_COLOR_SCHEME, Colors } from "deprecated/style/constants";

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
        params.className,
      )}
      style={style as React.CSSProperties}
      onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        !disabled && params.onClick?.(e)
      }
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
          ...params,
        })
      ) : (
        <span className={textClassName} style={textStyle as React.CSSProperties}>
          {text}
        </span>
      )}
    </div>
  );
};

const MemoizedTagRenderer = React.memo(TagRenderer) as typeof TagRenderer;

export const Tag = <
  M extends Model.Model = Model.Model,
  S extends React.CSSProperties | Pdf.Style = React.CSSProperties,
>(
  props: TagProps<M, S>,
): JSX.Element => {
  const tagText = useMemo((): string | M[keyof M] => {
    if (props.isPlural === true && !isNil(props.pluralText)) {
      return props.pluralText;
    } else if (!isNil(props.text)) {
      return props.text;
    } else if (!isNil(props.children)) {
      if (typeof props.children === "string") {
        return props.children;
      }
      return model.getModelName(props.children, {
        isPlural: props.isPlural,
        getModelName: props.getModelText,
        modelNameField: props.modelTextField,
      });
    } else if (!isNil(props.model)) {
      return model.getModelName(props.model, {
        isPlural: props.isPlural,
        getModelName: props.getModelText,
        modelNameField: props.modelTextField,
      });
    }
    return "";
  }, [
    props.isPlural,
    props.pluralText,
    props.text,
    props.children,
    props.model,
    props.getModelText,
    props.modelTextField,
  ]);

  const tagColor = useMemo((): Style.HexColor | null => {
    if (props.color !== undefined) {
      return model.validatedColor(props.color);
    } else if (!isNil(props.children) && typeof props.children !== "string") {
      return model.getModelColor(props.children, {
        scheme: props.scheme,
        getModelColor: props.getModelColor,
        modelColorField: props.modelColorField,
      });
    } else if (!isNil(props.model)) {
      return model.getModelColor(props.model, {
        scheme: props.scheme,
        getModelColor: props.getModelColor,
        modelColorField: props.modelColorField,
      });
    } else if (!isNil(props.colorIndex)) {
      const colorScheme = props.scheme || DEFAULT_COLOR_SCHEME;
      if (!isNil(colorScheme[props.colorIndex])) {
        return colorScheme[props.colorIndex];
      }
      return Colors.COLOR_NO_COLOR;
    }
    return util.selectConsistent(props.scheme || DEFAULT_COLOR_SCHEME, tagText as string);
  }, [
    tagText,
    props.color,
    props.children,
    props.getModelColor,
    props.modelColorField,
    props.scheme,
    props.colorIndex,
  ]);

  const tagTextColor = useMemo(() => {
    if (!isNil(props.textColor)) {
      return props.textColor;
    }
    /* The tagColor is null when we want the tag to be transparent, in which case
		   the secondary text color should be contrasted enough on the background. */
    return tagColor !== null
      ? util.colors.contrastedForegroundColor(tagColor)
      : Colors.TEXT_SECONDARY;
  }, [tagColor, props]);

  const renderParams = useMemo<ITagRenderParams<S>>(
    () => ({
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
      disabled: props.disabled,
    }),
    [
      props.className,
      props.textClassName,
      props.style,
      props.textStyle,
      props.uppercase,
      tagColor,
      tagTextColor,
      tagText,
      props.fillWidth,
    ],
  );

  /* If the render method is provided, it is responsible for rendering the
     entire Tag - not just the contents inside of the Tag.  This is primarily
     just used for PDF purposes. */
  if (!isNil(props.render)) {
    return <TooltipWrapper tooltip={props.tooltip}>{props.render(renderParams)}</TooltipWrapper>;
  }
  return (
    <TooltipWrapper tooltip={props.tooltip}>
      <MemoizedTagRenderer<S> {...renderParams} />
    </TooltipWrapper>
  );
};

export default React.memo(Tag) as typeof Tag;
