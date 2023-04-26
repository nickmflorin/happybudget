import { type MouseEvent } from "react";

import classNames from "classnames";
import { Optional } from "utility-types";

import * as errors from "application/errors";
import { feedback, ui } from "lib";
import * as icons from "lib/ui/icons";
import { BareActionButton } from "components/buttons";
import { FeedbackIcon } from "components/icons";

/*
Props for the GlobalFeedback component for cases where the feedback is provided as an HTTP Error.
When the feedback is provided as an HTTP Error, the feedback is not managed - if it were, the Error
would have been converted to a feedback object, ManagedGlobalFeedback.  Because it is not managed,
it cannot have an onClose handler.
*/
type GlobalFeedbackErrorProps = ui.ComponentProps & {
  readonly error: errors.ApiGlobalError | errors.NetworkError | undefined;
};

/*
Props for the GlobalFeedback component for cases where the feedback is provided as a feedback
object.
Here, the type feedback.ManagedGlobalFeedback represents a feedback.GlobalFeedback element that is
being managed by the Feedback Manager.  When globally scoped feedback is added to the
Feedback Manager, the Feedback Manager adds a randomly generated ID and an optionally provided
`onClose` callback to the feedback.GlobalFeedback element.
(The ID is used to remove the feedback element from state when the onClose callback is triggered.)
Since it is possible that this component is used for a feedback type that is not managed (i.e. just
feedback.GlobalFeedback - without the ID or 'onClose' callback) - allowing those attributes to be
optional allows this component to be used for both cases; the case where the feedback is managed by
the manager and the case where the feedback is being rendered manually outside the context of the
hook.
*/
export type GlobalFeedbackFeedbackProps<P extends feedback.FeedbackType = feedback.FeedbackType> =
  ui.ComponentProps & Optional<feedback.ManagedGlobalFeedback<P>, "onClose" | "id">;

/* The GlobalFeedback must be capable of rendering with both a managed and an unmanaged form of
   GlobalFeedback - and if it is unmanaged, it may also be an HTTP Error. */
export type GlobalFeedbackProps<P extends feedback.FeedbackType = feedback.FeedbackType> =
  | GlobalFeedbackErrorProps
  | GlobalFeedbackFeedbackProps<P>;

const propsHasError = <P extends feedback.FeedbackType = feedback.FeedbackType>(
  props: GlobalFeedbackProps<P>,
): props is GlobalFeedbackErrorProps =>
  (props as GlobalFeedbackErrorProps).error !== undefined &&
  errors.isGlobalFeedbackError((props as GlobalFeedbackErrorProps).error);

export const GlobalFeedback = <P extends feedback.FeedbackType = feedback.FeedbackType>(
  props: GlobalFeedbackProps<P>,
): JSX.Element =>
  propsHasError(props) && props.error === undefined ? (
    <></>
  ) : (
    <div
      style={props.style}
      id={props.id !== undefined ? `global-feedback-${props.id}` : undefined}
      className={classNames(
        "global-feedback",
        `global-feedback--${
          propsHasError(props)
            ? (props.error as errors.ApiGlobalError | errors.NetworkError).toFeedback().feedbackType
            : props.feedbackType
        }`,
        props.className,
      )}
    >
      <FeedbackIcon
        feedbackType={
          propsHasError(props)
            ? (props.error as errors.ApiGlobalError | errors.NetworkError).toFeedback().feedbackType
            : props.feedbackType
        }
      />
      <div className="global-feedback__text">
        {propsHasError(props)
          ? (props.error as errors.ApiGlobalError | errors.NetworkError).toFeedback().message
          : props.message}
      </div>
      {!propsHasError(props) && props.onClose !== undefined && (
        <BareActionButton
          className="button--global-feedback-close"
          icon={icons.IconNames.XMARK}
          size={ui.ButtonSizes.MEDIUM}
          onClick={(e: MouseEvent<HTMLButtonElement>) => props.onClose?.(e)}
        />
      )}
    </div>
  );
