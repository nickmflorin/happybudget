import classNames from "classnames";

import * as ui from "lib/ui";
import { buttons } from "lib/ui";
import { PrimaryButton, SecondaryButton } from "components/buttons";
import { Separator } from "components/structural";

export type FormFooterProps = ui.ComponentProps<{
  readonly submitButtonText?: string;
  readonly cancelButtonText?: string;
  /**
   * The size of the buttons that appear in the Form's footer for submitting and optionally
   * cancelling.
   */
  readonly buttonSize?: buttons.ButtonSize;
  /**
   * Whether or not submit actions in the Form should be disabled.
   */
  readonly disabled?: boolean;
  /**
   * Indicates whether or not the Form is currently making a request associated with its submit
   * action.  When the Form is considered to be "submitting", the submit button will show a
   * loading indicator.
   */
  readonly submitting?: boolean;
  /**
   * A callback that should be invoked when the cancel button is clicked.  If this prop is not
   * provided, the cancel button will not be present.
   */
  readonly onCancel?: () => void;
}>;

export const FormFooter = ({
  submitButtonText = "Submit",
  buttonSize = buttons.ButtonSizes.MEDIUM,
  cancelButtonText = "Cancel",
  submitting,
  disabled,
  onCancel,
  ...props
}: FormFooterProps): JSX.Element => (
  <div {...props} className={classNames("form__footer", props.className)}>
    <Separator />
    <div className="form__footer__buttons">
      {onCancel && (
        <SecondaryButton size={buttonSize} onClick={onCancel}>
          {cancelButtonText}
        </SecondaryButton>
      )}
      <PrimaryButton
        type="submit"
        size={buttonSize}
        disabled={disabled || submitting}
        loading={submitting}
      >
        {submitButtonText}
      </PrimaryButton>
    </div>
  </div>
);
