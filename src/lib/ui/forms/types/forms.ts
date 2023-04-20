import {
  type UseFormReturn,
  type UseFormProps,
  type FormState as RootFormState,
  type RegisterOptions,
} from "react-hook-form";

import * as feedback from "../../../feedback";

import * as fields from "./fields";
import { InputElement } from "./input";

export type FormData = Record<string, unknown>;

/**
 * The configuration object that is optionally provided to the 'useForm' hook, which is a
 * combination of "react-hook-form"'s 'useForm' props alongside the configuration that is required
 * to use the 'useFeedbackManager' internal hook.
 */
export type FormConfig<D extends FormData = FormData> = UseFormProps<D> &
  feedback.FeedbackManagerConfig;

export type FormFeedbackConfig = feedback.FeedbackManagerConfig & {
  readonly shouldFocus: boolean;
};

export type FormFeedback<
  D extends FormData = FormData,
  T extends feedback.FeedbackType = feedback.FeedbackType,
> = feedback.Feedback<T, fields.FieldName<D>>;

/**
 * The state of the Form.
 *
 * This type overrides the original "react-hook-form" package's 'FormState' object in order to
 * both clearly denote the errors related to validation as being validation errors while including
 * internally defined feedback, {@link feedback.FeedbackManagerFeedback}, on the Form.
 *
 * @see FormInstance
 */
export type FormState<D extends FormData = FormData> = Omit<RootFormState<D>, "errors"> & {
  readonly validationErrors: RootFormState<D>["errors"];
  readonly feedback: feedback.FeedbackManagerFeedback<fields.FieldName<D>>;
};

/**
 * Represents the characteristics and methods that are exposed and can be used to control a Form
 * component.
 *
 * The type is a combination of the "react-hook-form"'s 'useForm' hook's return type,
 * {@link UseFormReturn<D>}, with our own internal overrides and typings.  Certain methods and
 * attributes on the original return type, {@link UseFormReturn<D>}, are overridden such that they
 * are consistent with the use cases in this application.
 *
 * Error Handling Responsibilities
 * -------------------------------
 * The form implementation described by the {@link FormInstance} type, and its associated hook,
 * 'useForm' (the internal implementation, not "react-hook-form"'s implementation), uses its own
 * error handling mechanics via the 'useFeedbackManager' hook.  However, the Form still needs
 * to leverage "react-hook-form"'s error handling *just for client side validation purposes*.
 *
 * When validation errors occur on the server, the response will be rendered and the information
 * in the response can be used to provide feedback to the Form via the 'useFeedbackManager' hook.
 * When validation errors occur client side, via "react-hook-form", we still have to allow the
 * original 'useForm' hook's implementation to handle those validation errors properly - because
 * the validation errors are related to the valid/invalid state of the form and other mechanical
 * implementations that are needed.
 *
 * Implementing the validation internally would be laborious, and difficult, so error handling
 * related to validation errors on the original "react-hook-form"'s 'useForm' hook is left in tact,
 * but internal mechanics that are used for feedback and error handling that are not related to
 * client side validation (but usually server side validation) are implemented via the feedback
 * mechanics defined internally.
 */
export type FormInstance<D extends FormData = FormData> = Omit<
  UseFormReturn<D>,
  /*
  Explanations for Prop Omission:

  1. clearErrors:
     The `clearErrors` method on the original 'useForm' hook does not apply to validation errors,
     and since we are only using the validation errors from "react-hook-form"'s original hook,
     'useForm', but our own hooks for non-validation errors, the entire method can be replaced with
     our 'clearFeedback' method - which is exposed as a part of the FeedbackManager.

  2. setError:
     Omitted for the same reasons that we omit 'clearErrors' - it does not apply to validation
     errors and validation errors are the only aspect of "react-hook-form" that we are using their
     error handling for.  The internal `setFeedback` method should be used instead.

  3. control:
     The `control` property on the original 'useForm' hook does not include our internal field
     registration, but only "react-hook-form"'s field registration.  It is not safe to override
     this value, but instead we name the attribute as being `__control__` to denote that the
     attribute should not be accessed.

     The only time the `__control__` attribute is needed is when the <ControlledField /> component
     is registering the controlled input.

  4. resetField, register and formState
     These attributes are not excluded but simply overridden to include internal context.
  */
  "setError" | "clearErrors" | "resetField" | "register" | "formState" | "control" | "getFieldState"
> &
  Omit<
    /* When working with a Form, there will never be a use case where the feedback needs to be
       appended to.  The only use case will be cases where the entire feedback needs to be set based
       on a response from the server. */
    feedback.FeedbackManager<fields.FieldName<D>, FormFeedbackConfig>,
    "addError" | "addFeedback" | "addWarning" | "addSuccess"
  > & {
    /**
     * The current state of the {@link FormInstance}.
     *
     * Includes the original "react-hook-form"'s {@link FormState} attributes alongside internally
     * defined feedback related attributes on the Form.
     *
     * Reference: https://react-hook-form.com/api/useform/formstate
     */
    readonly formState: FormState<D>;
    /**
     * Returns the field state, {@link FieldState<D, N>}, associated with the field that is named
     * with the provided name, {@link N}.
     *
     * This method, which overrides the method on the original "react-hook-form" 'useForm' hook,
     * does not account for the second argument (formState) that the original 'useForm' hook method
     * does.  This is due to the fact that it is likely unnecessary and would make the override more
     * complicated.  If we do need to expose that additional argument here in the future, we should
     * update the function signature below.
     *
     * Reference: https://react-hook-form.com/api/useform/getfieldstate
     */
    readonly getFieldState: <N extends fields.FieldName<D>>(name: N) => fields.FieldState<D, N>;
    /**
     * Registers a given field with the Form with optionally provided validation rules and returns
     * relevant information used to render and control that field.
     *
     * This method overrides the method on the original "react-hook-form" 'useForm' hook by exposing
     * both a potential validation error, {@link FieldError}, and feedback elements,
     * {@link FormFieldFeedback<D>[]}, associated with the field.  This information will be used
     * to render the field in a given feedback or validation state.
     *
     * The information provided consists of:
     *
     * 1. onChange: The onChange prop that subscribes to the input change event ("react-hook-form").
     * 2. onBlur: The onBlur prop that subscribes to the input blur event ("react-hook-form").
     * 3. ref: {@link React.Ref<any>} Input reference for hook form to register ("react-hook-form").
     * 4. name: {@link string} The name of the field ("react-hook-form").
     * 5. feedback: {@link FormFieldFeedback<D>[]} Feedback associated with the field.
     * 6. validationError: {@link FieldError | undefined} Validation error (if any) that is
     *      associated with the field.
     *
     * Reference: https://react-hook-form.com/api/useform/register
     */
    readonly register: <N extends fields.FieldName<D>, E extends InputElement = InputElement>(
      name: N,
      options?: RegisterOptions<D, N>,
    ) => fields.FieldRegistration<D, N, E>;
    /**
     * Resets the state of the field.
     *
     * This method overrides the method on the original "react-hook-form" 'useForm' hook by exposing
     * options to also reset both the validation error and the feedback,
     * {@link FormFieldFeedback<D>[]}, instead of just the validation error, {@link FieldError},
     * itself.
     *
     * Reference: https://react-hook-form.com/api/useform/resetfield
     */
    readonly resetField: <N extends fields.FieldName<D>>(
      name: N,
      /* There is not a "react-hook-form" type that we can import for the options, so they must be
         explicitly defined. */
      options?: Partial<{
        keepDirty: boolean;
        keepTouched: boolean;
        keepFeedback: boolean; // Additional option for removing or keeping feedback.
        keepValidationError: boolean; // Replaces "keepError"
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        defaultValue: any;
      }>,
    ) => void;
    /**
     * The original "react-hook-form"'s `control` attribute on the form instance,
     * {@link FormInstance}, but denoted with underscores to discourage accessing and usage.  This
     * attribute should only be accessed in rare cases, because it does not include internal
     * field registration.
     */
    readonly __control__: UseFormReturn<D>["control"];
    /**
     * Whether or not submit actions in the Form should be disabled.
     */
    readonly disabled?: boolean;
    /**
     * Whether or not the Form as a whole should be considered to be in a loading state.  When the
     * Form itself is in a loading state, a loading indicator will appear over the Form, centered
     * both vertically and horizontally.
     */
    readonly loading?: boolean;
    /**
     * Indicates whether or not the Form is currently making a request associated with its submit
     * action.  When the Form is considered to be "submitting", the submit button will show a
     * loading indicator.
     */
    readonly submitting?: boolean;
    readonly setDisabled: (v: boolean) => void;
    readonly setLoading: (v: boolean) => void;
    readonly setSubmitting: (v: boolean) => void;
  };
