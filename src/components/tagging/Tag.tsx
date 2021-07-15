import { useMemo } from "react";
import classNames from "classnames";
import { isNil, map } from "lodash";
import { DEFAULT_TAG_COLOR_SCHEME, DEFAULT_TAG_COLOR, DEFAULT_TAG_TEXT_COLOR } from "config";
import { selectConsistent, getKeyValue } from "lib/util";
import { contrastedForegroundColor } from "lib/util/colors";
import { isModelWithColor, isModelWithName, isTag } from "lib/model/typeguards";

import "./Tag.scss";

const TagRenderer = (props: ITagRenderParams): JSX.Element => {
  return (
    <div
      className={classNames("tag", { uppercase: props.uppercase }, { "fill-width": props.fillWidth }, props.className)}
      style={{ ...props.style, backgroundColor: props.color, color: props.textColor }}
    >
      {props.text}
    </div>
  );
};

const isVisibleEmptyTagProps = (
  props: VisibleEmptyTagProps | InvisibleEmptyTagProps
): props is VisibleEmptyTagProps => {
  return (props as InvisibleEmptyTagProps).visible !== false;
};

export const EmptyTag: React.FC<EmptyTagProps> = (props: EmptyTagProps) => {
  return (
    <Tag style={{ ...props.style, opacity: isVisibleEmptyTagProps(props) ? 1 : 0 }}>
      {isVisibleEmptyTagProps(props) ? props.text : "None"}
    </Tag>
  );
};

const Tag = <M extends Model.M = Model.M>(props: TagProps<M>): JSX.Element => {
  const colorScheme = useMemo(() => {
    let tagColorScheme = DEFAULT_TAG_COLOR_SCHEME;
    if (!isNil(props.scheme)) {
      tagColorScheme = props.scheme;
    }
    return tagColorScheme;
  }, [props.scheme]);

  const tagText = useMemo((): string | M[keyof M] => {
    const getTextFromModel = (m: M): string | M[keyof M] => {
      if (!isNil(props.modelTextField)) {
        const modelTextFieldValue = getKeyValue<M, keyof M>(props.modelTextField)(m);
        if (!isNil(modelTextFieldValue) && typeof modelTextFieldValue !== "string") {
          /* eslint-disable no-console */
          console.error(`The field ${props.modelTextField} did not return a string.`);
          return "";
        }
        return modelTextFieldValue || "";
      } else if (isTag(m)) {
        return m.title;
      } else if (isModelWithName(m)) {
        return m.name || "";
      }
      return "";
    };
    if (!isNil(props.text)) {
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

  const tagColor = useMemo((): string => {
    const validateAndReturnColor = (color: string | null | undefined, field: string): string => {
      if (isNil(color)) {
        return DEFAULT_TAG_COLOR;
      } else if (typeof color !== "string") {
        /* eslint-disable no-console */
        console.error(`The field ${field} did not return a string color.`);
        return DEFAULT_TAG_COLOR;
      }
      if (!color.startsWith("#")) {
        color = `#${color}`;
      }
      if (color.length !== 7) {
        /* eslint-disable no-console */
        console.error(`The field ${field} did not return a valid HEX string color.`);
        return DEFAULT_TAG_COLOR;
      }
      return color;
    };
    const getColorFromModel = (m: M): string => {
      if (!isNil(props.modelColorField)) {
        const modelColorFieldValue: unknown = m[props.modelColorField];
        return validateAndReturnColor(modelColorFieldValue as string, props.modelColorField as string);
      } else if (isTag(m)) {
        return validateAndReturnColor(m.color, "color");
      } else if (isModelWithColor(m)) {
        return validateAndReturnColor(m.color, "color");
      } else if (typeof m.id === "number" && !isNil(colorScheme[m.id])) {
        return colorScheme[m.id];
      }
      return "";
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
      return DEFAULT_TAG_COLOR;
    }
    return selectConsistent(colorScheme, tagText as string);
  }, [props]);

  const tagTextColor = useMemo(() => {
    if (!isNil(props.textColor)) {
      return props.textColor;
    }
    return contrastedForegroundColor(tagColor);
  }, [tagColor, props]);

  const renderParams = useMemo((): ITagRenderParams => {
    return {
      className: props.className,
      uppercase: props.uppercase || false,
      color: (tagColor as string) || DEFAULT_TAG_COLOR,
      textColor: tagTextColor || DEFAULT_TAG_TEXT_COLOR,
      text: tagText as string,
      fillWidth: props.fillWidth || false
    };
  }, [props.className, props.uppercase, tagColor, tagTextColor, tagText, props.fillWidth]);

  if (!isNil(props.render)) {
    return props.render(renderParams);
  }
  return <TagRenderer {...renderParams} />;
};

const isEmptyTagsPropsNotComponent = (props: EmptyTagProps | JSX.Element): props is EmptyTagProps => {
  return typeof props === "object";
};

const emptyTagPropsOrComponent = (props: JSX.Element | EmptyTagProps): JSX.Element => {
  return isEmptyTagsPropsNotComponent(props) ? <EmptyTag {...props} /> : props;
};

/**
 * Group of <Tag> components that overlap to a certain degree.
 *
 * This component can be created in 3 different ways:
 *
 * (1) Explicitly Provided ITag Objects:
 *     <MultipleTags tags={[{ text: "foo", color: "red" }, { text: "bar", color: "blue" }]} />
 *
 * (2) Provided Model (M) Objects:
 *     <MultipleTags models={[ {...}, {...} ]} modelColorField={"color"} modelTextField={"name"}]} />
 *
 * (3) Children <Tag> Components:
 *     <MultipleTags><Tag /><Tag /></MultipleTags>
 */
export const MultipleTags = <M extends Model.M = Model.M>(props: MultipleTagsProps<M>): JSX.Element => {
  return (
    <div className={classNames("multiple-tags-wrapper", props.className)} style={props.style}>
      {!isNil(props.models) ? (
        /* eslint-disable indent */
        props.models.length !== 0 || isNil(props.onMissing) ? (
          map(props.models, (model: M, index: number) => {
            return <Tag key={index} model={model} {...props.tagProps} />;
          })
        ) : (
          emptyTagPropsOrComponent(props.onMissing)
        )
      ) : !isNil(props.tags) ? (
        props.tags.length !== 0 || isNil(props.onMissing) ? (
          map(props.tags, (tag: ITag, index: number) => {
            // For each object, ITag, in the series, the ITag object can explicitly set the color,
            // textColor and uppercase setting for that created <Tag>.  However, these fields are
            // optional for each specific ITag, and if not set on any given individual ITag object,
            // can be applied to all created <Tag> components based on the textColor, color and
            // uppercase setting supplied globally as props to this MultipleTags component.
            return (
              <Tag
                key={index}
                text={tag.text}
                {...props.tagProps}
                color={!isNil(tag.color) ? tag.color : props.tagProps?.color}
                textColor={!isNil(tag.textColor) ? tag.textColor : props.tagProps?.textColor}
                uppercase={!isNil(tag.uppercase) ? tag.uppercase : props.tagProps?.uppercase}
                colorIndex={index}
              />
            );
          })
        ) : isEmptyTagsPropsNotComponent(props.onMissing) ? (
          <EmptyTag {...props.onMissing} />
        ) : (
          props.onMissing
        )
      ) : (
        !isNil(props.children) &&
        (props.children.length !== 0 || isNil(props.onMissing)
          ? props.children
          : emptyTagPropsOrComponent(props.onMissing))
      )}
    </div>
  );
};

Tag.emptyTagPropsOrComponent = emptyTagPropsOrComponent;
Tag.Empty = EmptyTag;
Tag.Multiple = MultipleTags;
export default Tag;
