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

interface VisibleEmptyTagProps extends StandardComponentProps {
  readonly visible?: true;
  readonly text: string;
}

interface InvisibleEmptyTagProps extends StandardComponentProps {
  readonly visible: false;
}

export type EmptyTagProps = VisibleEmptyTagProps | InvisibleEmptyTagProps;

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

const isTagTextProps = (props: TagProps<any>): props is _TagTextProps => {
  return (
    (props as _TagTextProps).text !== undefined &&
    (props as _TagModelProps<any>).model === undefined &&
    (props as _TagChildrenProps).children === undefined
  );
};

const isTagModelProps = <M extends Model.Model = Model.Model>(props: TagProps<M>): props is _TagModelProps<M> => {
  return (
    (props as _TagTextProps).text === undefined &&
    (props as _TagModelProps<M>).model !== undefined &&
    (props as _TagChildrenProps).children === undefined
  );
};

const Tag = <M extends Model.Model = Model.Model>(props: TagProps<M>): JSX.Element => {
  const colorScheme = useMemo(() => {
    let tagColorScheme = DEFAULT_TAG_COLOR_SCHEME;
    if (!isNil(props.scheme)) {
      tagColorScheme = props.scheme;
    }
    return tagColorScheme;
  }, [props.scheme]);

  const tagText: string | M[keyof M] = useMemo(() => {
    if (isTagTextProps(props)) {
      return props.text;
    } else if (isTagModelProps(props)) {
      if (isTag(props.model)) {
        return props.model.title;
      } else if (!isNil(props.modelTextField) && !isNil(getKeyValue<M, keyof M>(props.modelTextField)(props.model))) {
        return getKeyValue<M, keyof M>(props.modelTextField)(props.model);
      } else if (isModelWithName(props.model)) {
        return props.model.name || "";
      } else {
        return "";
      }
    } else {
      return props.children;
    }
  }, [props]);

  const tagColor: string | undefined | null | M[keyof M] = useMemo(() => {
    if (isTagModelProps(props)) {
      if (isTag(props.model)) {
        // If this is a Tag model, we don't want to infer/guess a color if it is not defined - we
        // want to use the default color.
        return props.model.color || DEFAULT_TAG_COLOR;
      } else {
        if (!isNil(props.modelColorField) && !isNil(getKeyValue<M, keyof M>(props.modelColorField)(props.model))) {
          // Can be null, the Tag will use the default color.
          return props.model[props.modelColorField] || DEFAULT_TAG_COLOR;
        } else if (isModelWithColor(props.model)) {
          // Can be null, the Tag will use the default color.
          return props.model.color || DEFAULT_TAG_COLOR;
        } else if (!isNil(props.colorIndex) && !isNil(colorScheme[props.colorIndex])) {
          return colorScheme[props.colorIndex];
        } else if (!isNil(colorScheme[props.model.id])) {
          return colorScheme[props.model.id];
        } else {
          return selectConsistent(colorScheme, tagText as string);
        }
      }
    } else {
      if (!isNil(props.color)) {
        return props.color;
      } else if (!isNil(props.colorIndex) && !isNil(colorScheme[props.colorIndex])) {
        return colorScheme[props.colorIndex];
      } else {
        return selectConsistent(colorScheme, tagText as string);
      }
    }
  }, [colorScheme, tagText, props]);

  const tagTextColor = useMemo(() => {
    if (!isNil(props.textColor)) {
      return props.textColor;
    } else if (isTagModelProps(props) && isTag(props.model)) {
      if (props.model.color === null) {
        return DEFAULT_TAG_TEXT_COLOR;
      }
      return contrastedForegroundColor(props.model.color);
    }
    return contrastedForegroundColor(tagColor as string);
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
  }, []);

  if (!isNil(props.render)) {
    return props.render(renderParams);
  }
  return <TagRenderer {...renderParams} />;
};

const isEmptyTagsPropsNotComponent = (props: EmptyTagProps | JSX.Element): props is EmptyTagProps => {
  return typeof props === "object";
};

const isMultipleTagsModelsProps = <M extends Model.Model = Model.Model>(
  props: MultipleTagsProps<M>
): props is _MultipleTagsModelsProps<M> => {
  return (
    (props as _MultipleTagsModelsProps<M>).models !== undefined &&
    (props as _MultipleTagsExplicitProps).tags === undefined &&
    (props as _MultipleTagsChildrenProps).children === undefined
  );
};

const isMultipleTagsExplicitProps = (props: MultipleTagsProps<any>): props is _MultipleTagsExplicitProps => {
  return (
    (props as _MultipleTagsModelsProps<any>).models === undefined &&
    (props as _MultipleTagsExplicitProps).tags !== undefined &&
    (props as _MultipleTagsChildrenProps).children === undefined
  );
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
export const MultipleTags = <M extends Model.Model = Model.Model>(props: MultipleTagsProps<M>): JSX.Element => {
  return (
    <div className={classNames("multiple-tags-wrapper", props.className)} style={props.style}>
      {isMultipleTagsModelsProps(props) &&
        /* eslint-disable indent */
        (props.models.length !== 0 || isNil(props.onMissing)
          ? map(props.models, (model: M, index: number) => {
              // Here, the props textColor and color will override the color selection (if modelColorField
              // is not provided) and cause the <Tag>(s) to be the same uniform color/background color.
              return (
                <Tag
                  key={index}
                  model={model}
                  modelTextField={props.modelTextField}
                  modelColorField={props.modelColorField}
                  color={props.color}
                  textColor={props.textColor}
                  scheme={props.scheme}
                  uppercase={props.uppercase}
                  colorIndex={model.id}
                />
              );
            })
          : emptyTagPropsOrComponent(props.onMissing))}
      {isMultipleTagsExplicitProps(props) &&
        (props.tags.length !== 0 || isNil(props.onMissing) ? (
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
                color={!isNil(tag.color) ? tag.color : props.color}
                textColor={!isNil(tag.textColor) ? tag.textColor : props.textColor}
                scheme={props.scheme}
                uppercase={!isNil(tag.uppercase) ? tag.uppercase : props.uppercase}
                colorIndex={index}
              />
            );
          })
        ) : isEmptyTagsPropsNotComponent(props.onMissing) ? (
          <EmptyTag {...props.onMissing} />
        ) : (
          props.onMissing
        ))}
      {!isMultipleTagsExplicitProps(props) &&
        !isMultipleTagsModelsProps(props) &&
        (props.children.length !== 0 || isNil(props.onMissing)
          ? props.children
          : emptyTagPropsOrComponent(props.onMissing))}
    </div>
  );
};

Tag.emptyTagPropsOrComponent = emptyTagPropsOrComponent;
Tag.Empty = EmptyTag;
Tag.Multiple = MultipleTags;
export default Tag;
