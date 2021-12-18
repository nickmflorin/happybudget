import React from "react";
import classNames from "classnames";
import { isNil, map } from "lodash";

import Tag from "./Tag";
import EmptyTag from "./EmptyTag";

const isEmptyTagsPropsNotComponent = (props: EmptyTagProps | JSX.Element): props is EmptyTagProps => {
  return typeof props === "object";
};

const emptyTagPropsOrComponent = (props: JSX.Element | EmptyTagProps): JSX.Element => {
  return isEmptyTagsPropsNotComponent(props) ? <EmptyTag {...props} /> : props;
};

const isPluralityWithModel = <M extends Model.Model = Model.Model>(
  m: M | PluralityWithModel<M>
): m is PluralityWithModel<M> => (m as PluralityWithModel<M>).model !== undefined;

/**
 * Group of <Tag> components that overlap to a certain degree.
 *
 * This component can be created in 3 different ways:
 *
 * (1) Explicitly Provided ITag Objects:
 *     <MultipleTags tags={[
 *     { text: "foo", color: "red" }, { text: "bar", color: "blue" }]} />
 *
 * (2) Provided Model (M) Objects:
 *     <MultipleTags models={
 *     [ {...}, {...} ]} modelColorField={"color"} modelTextField={"name"}]} />
 *
 * (3) Children <Tag> Components:
 *     <MultipleTags><Tag /><Tag /></MultipleTags>
 */
export const MultipleTags = <M extends Model.Model = Model.Model>(props: MultipleTagsProps<M>): JSX.Element => {
  return (
    <div className={classNames("multiple-tags-wrapper", props.className)} style={props.style}>
      {!isNil(props.models) ? (
        props.models.length !== 0 || isNil(props.onMissing) ? (
          map(props.models, (m: M | PluralityWithModel<M>, index: number) => {
            return (
              <Tag
                key={index}
                {...props.tagProps}
                model={isPluralityWithModel(m) ? m.model : m}
                isPlural={isPluralityWithModel(m) ? m.isPlural : props.tagProps?.isPlural}
              />
            );
          })
        ) : (
          emptyTagPropsOrComponent(props.onMissing)
        )
      ) : !isNil(props.tags) ? (
        props.tags.length !== 0 || isNil(props.onMissing) ? (
          map(props.tags, (tag: ITag, index: number) => {
            /* For each object, ITag, in the series, the ITag object can
							 explicitly set the color, textColor and uppercase setting for
							 that created <Tag>.  However, these fields are optional for each
							 specific ITag, and if not set on any given individual ITag object,
               can be applied to all created <Tag> components based on the
							 textColor, color and uppercase setting supplied globally as props
							 to this MultipleTags component. */
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

type MemoizedMultipleTagsType = {
  <M extends Model.Model = Model.Model>(props: MultipleTagsProps<M>): JSX.Element;
};

export default React.memo(MultipleTags) as MemoizedMultipleTagsType;
