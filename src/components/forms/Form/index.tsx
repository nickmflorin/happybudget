import React, { useEffect, forwardRef, useMemo, ForwardedRef } from "react";
import { filter, isNil, find, indexOf, map } from "lodash";
import classNames from "classnames";

import { Form as RootForm, Input } from "antd";

import { RenderWithSpinner } from "components";
import { Notifications } from "components/notifications";
import { ui } from "lib";

import FieldError from "./FieldError";
import Footer from "./Footer";
import FormItemSection from "./FormItemSection";
import FormItemComp from "./FormItem";
import FormLabel from "./FormLabel";
import FormTitle from "./FormTitle";

interface PrivateFormProps<T = Record<string, unknown>> extends FormProps<T> {
  children: JSX.Element[] | JSX.Element;
}

/**
 * HOC for an input type field that will auto focus the field on render.  This
 * is used to wrap the first field of a Form.Item when that Form.Item is the
 * first in a Form.
 */
const withAutoFocusInput =
  <P extends Record<string, unknown>>(Component: React.ComponentType<P>) =>
  (props: P): JSX.Element => {
    const inputRef = React.useRef<Input>(null);

    useEffect(() => {
      if (!isNil(inputRef.current) && !isNil(inputRef.current.focus)) {
        inputRef.current.focus();
      }
    }, [isNil(inputRef.current)]);
    return <Component {...props} ref={inputRef} autoFocus={true} />;
  };

/**
 * HOC for Form.Item that will auto focus the first child field if the field
 * is capable of being focused.
 */
const withFormItemFirstInputFocused = <
  T extends Record<string, unknown>,
  P extends { children: JSX.Element[] | JSX.Element; name: string } = {
    children: JSX.Element[] | JSX.Element;
    name: string;
    [key: string]: unknown;
  }
>(
  Component: React.ComponentType<P>,
  formProps: Omit<PrivateFormProps<T>, "loading" | "children">
) => {
  const FormItem = (props: P): JSX.Element => {
    const newChildren = useMemo<JSX.Element[]>(() => {
      /*
      NOTE: A Form.Item can have an Array of children, or a single child.  Each
      of which may or may not be an input field.
      */
      let c = Array.isArray(props.children) ? props.children : [props.children];
      /*
      NOTE: There are two options here:

      (1) Detect the first Input element and focus that (i.e. text input).
      (2) Only focus the first element if it is an element capable of being
          focused (achieved with the check for !isNil(inputRef.current.focus))
          in the `withAutoFocusInput` child HOC.

      The first option involves filtering the children (commented out below)
      - but it is not working properly, the filter does not seem to respect the
      Input type.  This is because of the use of forwardRef.

      However, that might not be what we want to do anyways...

      We do not want to skip the focus to the middle of the form if the first
      few elements are Select fields (which cannot be focused).
      */
      // const inputChildren = filter(c, (ci: JSX.Element) => ci.type === Input);
      const inputChildren = [...c];

      if (inputChildren.length !== 0) {
        const firstInputIndex = indexOf(c, inputChildren[0]);

        const AutoFocusInputComponent = withAutoFocusInput(inputChildren[0].type);

        c = [
          ...c.slice(0, firstInputIndex),
          <AutoFocusInputComponent
            key={firstInputIndex}
            {...inputChildren[firstInputIndex].props}
            /* We have to manually set the defaultValue because AntD will not
							 apply it since we are messing with the AntD form mechanics
							 here. */
            defaultValue={
              !isNil(formProps.initialValues) && !isNil(props.name) ? formProps.initialValues[props.name] : undefined
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement> | number) => {
              /*
              This is necessary in order to get changes to the fields of the
							<Form.Item> to reflect in the Form data.  Normally, AntD handles
							this for us - but since we are messing with the Form.Item
							structure here, we have to do it ourselves.

              Because this onChange handler can be used for many different input
							types, the event may or may not be a traditional React.ChangeEvent.
							For example, if the input element is a Select component, the event
							will just be the value of the chosen Select.Option.

              We could restrict the behavior to only apply to children input
							elements of type <Input />, but that does not seem to be possible
							due to uses of forwardRef (see above explanation).
              */
              const value = typeof e !== "number" ? e.target.value : e;
              if (!isNil(props.name)) {
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                formProps.form.setFieldsValue({ [props.name]: value } as any);
              }
              if (!isNil(inputChildren[0].props.onChange)) {
                inputChildren[firstInputIndex].props.onChange(e);
              }
            }}
          />,
          ...c.slice(firstInputIndex + 1)
        ];
      }
      return c;
    }, []);

    const newProps = { ...props, children: newChildren.length === 1 ? newChildren[0] : newChildren };
    return <Component {...newProps} />;
  };
  return React.memo(FormItem);
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const PrivateForm = <T extends Record<string, unknown> = any>(
  {
    loading,
    condensed,
    children,
    autoFocusField,
    title,
    titleIcon,
    formHeaderProps,
    autoSubmit,
    ...props
  }: PrivateFormProps<T>,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ref: ForwardedRef<any>
): JSX.Element => {
  const firstRender = ui.hooks.useTrackFirstRender();
  const childrenArray = useMemo<JSX.Element[]>(() => {
    /*
    Under certain conditions, we want to auto focus the first field of a Form.
    We accomplish this by looking at the children of the first Form.Item child
    component and auto focusing the first child of the first Form.Item child
		component if it can be focused.

    <Form>
      <Form.Item>
        <Input />  ===>  Auto Focused on Render
      </Form.Item>
      <Form.Item>
        <Input />
      </Form.Item>
    </Form>
    */
    let c = Array.isArray(children) ? children : [children];

    /* If the Form is being used inside of a modal, we focus the first field by
			 default.  Otherwise, we do not focus the first field by default. */
    const defaultAutoFocusFirstField = props.form.isInModal === true ? true : false;
    const propAutoFocusField = !isNil(autoFocusField) ? autoFocusField : props.form.autoFocusField;
    const useAutoFocusField = !isNil(propAutoFocusField) ? propAutoFocusField : defaultAutoFocusFirstField;

    /* We cannot use the HOC components after the first render.  This is because
			 AntD always rerenders the entire form when a field changes, so whenever
			 we would change another field, it would auto focus the other field
			 designated by `autoFocusField` again.  However, we cannot use an empty
       array for the dependency array of this useEffect, because then the
			 Form.Item(s) would not update appropriately when props change. */
    if (firstRender === true) {
      if (useAutoFocusField === true) {
        const formItemChildren = filter(c, (ci: JSX.Element) => ci.type === RootForm.Item || ci.type === FormItemComp);
        if (formItemChildren.length !== 0) {
          const firstFormItemIndex = indexOf(c, formItemChildren[0]);
          if (firstFormItemIndex !== -1) {
            const AutFocusFirstInputFormItemComponent = withFormItemFirstInputFocused<T>(
              formItemChildren[0].type,
              props
            );
            const newComponent = (
              <AutFocusFirstInputFormItemComponent key={firstFormItemIndex} {...formItemChildren[0].props} />
            );
            c = [...c.slice(0, firstFormItemIndex), newComponent, ...c.slice(firstFormItemIndex + 1)];
          }
        }
      } else if (typeof useAutoFocusField === "number") {
        const formItemChildren = filter(c, (ci: JSX.Element) => ci.type === RootForm.Item || ci.type === FormItemComp);
        const formItemAtIndex = formItemChildren[useAutoFocusField];
        if (!isNil(formItemAtIndex)) {
          const formItemIndexInOverall = indexOf(c, formItemChildren[useAutoFocusField]);
          if (formItemIndexInOverall !== -1) {
            const AutFocusFirstInputFormItemComponent = withFormItemFirstInputFocused<T>(formItemAtIndex.type, props);
            const newComponent = (
              <AutFocusFirstInputFormItemComponent key={formItemIndexInOverall} {...formItemAtIndex.props} />
            );
            c = [...c.slice(0, formItemIndexInOverall), newComponent, ...c.slice(formItemIndexInOverall + 1)];
          }
        }
      }
    }
    return c;
  }, [children]);

  const footer = useMemo<JSX.Element | undefined>(() => {
    return find(childrenArray, (child: JSX.Element) => child.type === Footer);
  }, [childrenArray]);

  return (
    <RootForm
      {...props}
      onValuesChange={(changedValues: Partial<T>, values: T) => {
        /* If auto submitting the form data after it changes, we need to clear
           the notifications on a change. */
        if (autoSubmit) {
          props.form.clearNotifications();
        }
        props.onValuesChange?.(changedValues, values);
      }}
      name={!isNil(props.name) ? props.name : props.form.isInModal === true ? "form_in_modal" : undefined}
      ref={ref}
      className={classNames(props.className, "form", { condensed })}
    >
      {!isNil(title) &&
        (typeof title === "string" && !isNil(titleIcon) ? (
          <div {...formHeaderProps} className={classNames("form-header", formHeaderProps?.className)}>
            <FormTitle icon={titleIcon} title={title} />
          </div>
        ) : (
          <div {...formHeaderProps} className={classNames("form-header", formHeaderProps?.className)}>
            {title}
          </div>
        ))}
      <RenderWithSpinner loading={!isNil(props.form.loading) ? props.form.loading : loading}>
        {map(
          filter(childrenArray, (child: JSX.Element) => child.type !== Footer),
          (element: JSX.Element, index: number) => (
            <React.Fragment key={index}>{element}</React.Fragment>
          )
        )}
        <Notifications notifications={props.form.notifications} />
        {!isNil(footer) && footer}
      </RenderWithSpinner>
    </RootForm>
  );
};

const Form = forwardRef(PrivateForm);

const exportable = {
  Form: Form,
  FieldError: FieldError,
  Footer: Footer,
  Item: FormItemComp,
  ItemSection: FormItemSection,
  Label: FormLabel
};

export default exportable;
