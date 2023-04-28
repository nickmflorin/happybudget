import classNames from "classnames";

import { core } from "lib";
import * as ui from "lib/ui";
import { forms, icons } from "lib/ui";
import { Noop } from "lib/util";
import { GlobalFeedbackDisplay } from "components/feedback";
import { Loading } from "components/loading";
import { ShowHide } from "components/util";

import { AsyncSelectField, AsyncSelectFieldProps } from "../fields/AsyncSelectField";
import { CheckboxField, CheckboxFieldProps } from "../fields/CheckboxField";
import { TextInputField, TextInputFieldProps } from "../fields/TextInputField";

import { FormFooter, FormFooterProps } from "./FormFooter";

export type FormFeedbackLocation = "top" | "bottom";

export type FormProps<D extends forms.FormData = forms.FormData> = Omit<
  FormFooterProps,
  keyof ui.ComponentProps
> &
  ui.ComponentProps<{
    readonly loading?: boolean;
    readonly children: core.ElementRestrictedNode;
    readonly form: forms.FormInstance<D>;
    /**
     * Controls whether or not the Form is responsible for rendering global feedback and if so,
     * where that feedback should be rendered.  If global feedback is being rendered outside of the
     * Form, perhaps in a containing entity, this prop should be `false`.
     */
    readonly renderGlobalFeedback?: FormFeedbackLocation | false;
    readonly onSubmit?: (d: D, e?: React.BaseSyntheticEvent) => void;
    readonly onSubmitError?: (
      errors: forms.ClientValidationErrors<D>,
      e?: React.BaseSyntheticEvent,
    ) => void;
  }>;

export const _Form = <D extends forms.FormData = forms.FormData>({
  form,
  children,
  submitButtonText,
  cancelButtonText,
  renderGlobalFeedback = "bottom",
  buttonSize,
  disabled,
  submitting,
  loading,
  onCancel,
  onSubmit = Noop,
  onSubmitError = Noop,
  ...props
}: FormProps<D>): JSX.Element => (
  <form
    {...props}
    className={classNames("form", props.className)}
    onSubmit={form.handleSubmit(onSubmit, onSubmitError)}
  >
    <Loading color={icons.IconColors.BRAND} loading={form.loading || loading}>
      <ShowHide show={renderGlobalFeedback === "top" && form.feedback.global.length !== 0}>
        <GlobalFeedbackDisplay
          className={classNames(
            "feedback-display--form",
            `feedback-display--form--${renderGlobalFeedback}`,
          )}
          feedback={form.feedback.global}
        />
      </ShowHide>
      {children}
      <ShowHide show={renderGlobalFeedback === "bottom" && form.feedback.global.length !== 0}>
        <GlobalFeedbackDisplay
          className={classNames(
            "feedback-display--form",
            `feedback-display--form--${renderGlobalFeedback}`,
          )}
          feedback={form.feedback.global}
        />
      </ShowHide>
      <FormFooter
        submitting={form.submitting || submitting}
        disabled={form.disabled || disabled}
        buttonSize={buttonSize}
        submitButtonText={submitButtonText}
        cancelButtonText={cancelButtonText}
        onCancel={onCancel}
      />
    </Loading>
  </form>
);

_Form.TextInputField = TextInputField;
_Form.AsyncSelectField = AsyncSelectField;
_Form.CheckboxField = CheckboxField;

export const Form = _Form as {
  <D extends forms.FormData = forms.FormData>(props: FormProps<D>): JSX.Element;
  CheckboxField<D extends forms.FormData, N extends forms.FieldName<D>>(
    props: CheckboxFieldProps<D, N>,
  ): JSX.Element;
  AsyncSelectField<
    D extends forms.FormData,
    N extends forms.FieldName<D>,
    O extends forms.BaseSelectOption = forms.SelectOption,
    M extends boolean = false,
  >(
    props: AsyncSelectFieldProps<D, N, O, M>,
  ): JSX.Element;
  TextInputField<D extends forms.FormData, N extends forms.FieldName<D>>(
    props: TextInputFieldProps<D, N>,
  ): JSX.Element;
};
