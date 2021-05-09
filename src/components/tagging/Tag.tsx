import { useMemo } from "react";
import classNames from "classnames";
import { isNil, map } from "lodash";
import { DEFAULT_TAG_COLOR_SCHEME, DEFAULT_TAG_COLOR, DEFAULT_TAG_TEXT_COLOR } from "config";
import { selectConsistent, getKeyValue } from "lib/util";
import { contrastedForegroundColor } from "lib/util/colors";
import { isModelWithColor, isModelWithName } from "lib/model/typeguards";

import "./Tag.scss";

/**
 * Represents the required data in it's most basic form that is used to create a Tag component.
 * This is meant to be used for creating MultipleTags components, when we want to provide the
 * data used to create the tags as a series of objects:
 *
 * <MultipleTags tags={[{ text: "foo", color: "red" }]} />
 */
export interface ITag {
  readonly color?: string | undefined | null;
  readonly textColor?: string | undefined | null;
  readonly uppercase?: boolean;
  readonly text: string;
}

interface PrivateTagProps extends StandardComponentProps {
  readonly children: string;
  readonly color?: string | undefined | null;
  readonly textColor?: string | undefined | null;
  readonly uppercase?: boolean;
  readonly fillWidth?: boolean;
}

/**
 * A Tag component in it's base level form.  This is not meant to be used externally to this
 * module, but only internally.
 */
const PrivateTag = ({
  children,
  color,
  fillWidth,
  textColor,
  uppercase,
  style = {},
  className
}: PrivateTagProps): JSX.Element => {
  return (
    <div
      className={classNames("tag", { uppercase }, { "fill-width": fillWidth }, className)}
      style={{ ...style, backgroundColor: color || DEFAULT_TAG_COLOR, color: textColor || DEFAULT_TAG_TEXT_COLOR }}
    >
      {children}
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

interface _TagCommonProps extends StandardComponentProps {
  readonly textColor?: string;
  readonly scheme?: string[];
  readonly uppercase?: boolean;
  readonly colorIndex?: number;
  readonly fillWidth?: boolean;
}

interface _TagModelProps<M extends Model.Model = Model.Model> extends _TagCommonProps {
  readonly model: M;
  readonly modelTextField?: keyof M;
  readonly modelColorField?: keyof M;
}

interface _TagTextProps extends _TagCommonProps {
  readonly text: string;
  readonly color?: string;
}

interface _TagChildrenProps extends _TagCommonProps {
  readonly children: string;
  readonly color?: string;
}

type TagProps<M extends Model.Model = Model.Model> = _TagModelProps<M> | _TagTextProps | _TagChildrenProps;

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
      if (!isNil(props.modelTextField) && !isNil(getKeyValue<M, keyof M>(props.modelTextField)(props.model))) {
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
      if (!isNil(props.modelColorField) && !isNil(getKeyValue<M, keyof M>(props.modelColorField)(props.model))) {
        return props.model[props.modelColorField]; // Can be null, the Tag will use the default color.
      } else if (isModelWithColor(props.model)) {
        return props.model.color; // Can be null, the Tag will use the default color.
      } else if (!isNil(props.colorIndex) && !isNil(colorScheme[props.colorIndex])) {
        return colorScheme[props.colorIndex];
      } else if (!isNil(colorScheme[props.model.id])) {
        return colorScheme[props.model.id];
      } else {
        return selectConsistent(colorScheme, tagText as string);
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
    }
    return contrastedForegroundColor(tagColor as string);
  }, [tagColor]);

  return (
    <PrivateTag
      className={props.className}
      uppercase={props.uppercase}
      color={tagColor as string}
      textColor={tagTextColor}
      style={props.style}
      fillWidth={props.fillWidth}
    >
      {tagText as string}
    </PrivateTag>
  );
};

// Common props used in all 3 different ways of instantiating a <MultipleTags> component.
interface _MultipleTagsProps extends StandardComponentProps {
  // Globally provided color - will be set on all created <Tag> components if the color is not
  // explicitly provided to that <Tag> component (either by means of the ITag object or the
  // model M used to generate the <Tag> component).
  color?: string;
  // Globally provided textColor - will be set on all created <Tag> components if the textColor is not
  // explicitly provided to that <Tag> component (either by means of the ITag object or the
  // model M used to generate the <Tag> component).
  textColor?: string;
  scheme?: string[];
  // Globally provided uppercase setting - will be set on all created <Tag> components if the uppercase
  // setting is not explicitly provided to the <Tag> component (by means of the ITag object only).
  uppercase?: boolean;
  // If the list of Models (M) or list of ITag objects or Array of Children <Tag> components is empty,
  // this will either render the component provided by onMissingList or create an <EmptyTag> component
  // with props populated from this attribute.
  onMissing?: JSX.Element | EmptyTagProps;
}

// <Tag> components are provided as children to the component:
// <MultipleTags><Tag /><Tag /></MultipleTags>
interface _MultipleTagsChildrenProps extends _MultipleTagsProps {
  children: typeof Tag[];
}

// <Tag> components should be generated based on a set of provided models M.
interface _MultipleTagsModelsProps<M extends Model.Model = Model.Model> extends _MultipleTagsProps {
  models: M[];
  modelTextField?: keyof M;
  modelColorField?: keyof M;
}

// <Tag> components should be generated based on a provided Array of objects (ITag), each of which
// contains the properties necessary to create a <Tag> component.
interface _MultipleTagsExplicitProps extends _MultipleTagsProps {
  tags: ITag[];
}

const isEmptyTagsPropsNotComponent = (props: EmptyTagProps | JSX.Element): props is EmptyTagProps => {
  return typeof props === "object";
};

export type MultipleTagsProps<M extends Model.Model = Model.Model> =
  | _MultipleTagsChildrenProps
  | _MultipleTagsModelsProps<M>
  | _MultipleTagsExplicitProps;

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
          ? map(props.models, (model: M) => {
              // Here, the props textColor and color will override the color selection (if modelColorField
              // is not provided) and cause the <Tag>(s) to be the same uniform color/background color.
              return (
                <Tag
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
