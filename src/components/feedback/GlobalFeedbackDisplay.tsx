import React, { useMemo } from "react";

import classNames from "classnames";
import { Optional } from "utility-types";

import * as errors from "application/errors";
import { feedback, ui } from "lib";

import { GlobalFeedback } from "./GlobalFeedback";

type GlobalFeedbackForm =
  | errors.GlobalFeedbackError
  | Optional<feedback.ManagedGlobalFeedback, "onClose" | "id">;

export type GlobalFeedbackDisplayProps = ui.ComponentProps<{
  readonly feedback?: (undefined | GlobalFeedbackForm)[];
}>;

export const GlobalFeedbackDisplay = ({
  feedback,
  ...props
}: GlobalFeedbackDisplayProps): JSX.Element => {
  const presentFeedback = useMemo<GlobalFeedbackForm[]>(
    () =>
      (feedback || []).filter(
        (
          f:
            | undefined
            | errors.GlobalFeedbackError
            | Optional<feedback.ManagedGlobalFeedback, "onClose" | "id">,
        ) => f !== undefined,
      ) as GlobalFeedbackForm[],
    [feedback],
  );

  if (presentFeedback.length === 0) {
    return <></>;
  }
  return (
    <div {...props} className={classNames("global-feedback-display", props.className)}>
      {presentFeedback.map((f: GlobalFeedbackForm, i: number) =>
        errors.isGlobalFeedbackError(f) ? (
          <GlobalFeedback key={i} error={f} />
        ) : (
          <GlobalFeedback key={i} {...f} />
        ),
      )}
    </div>
  );
};
