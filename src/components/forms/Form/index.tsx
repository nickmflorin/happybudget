import React, { forwardRef, useMemo } from "react";
import { filter, isNil, find, indexOf, map } from "lodash";
import classNames from "classnames";

import { Form as RootForm, Input } from "antd";

import { RenderWithSpinner } from "components";
import Error from "./Error";
import Footer from "./Footer";
import { FormProps } from "./model";
import useForm from "./useForm";
import { useEffect } from "react";

export * from "./model";

interface PrivateFormProps<T = any> extends FormProps<T> {
  children: JSX.Element[] | JSX.Element;
}

/**
 * HOC for an input type field that will auto focus the field on render.  This
 * is used to wrap the first field of a Form.Item when that Form.Item is the
 * first in a Form.
 */
const withAutoFocusInput =
  <P extends object>(Component: React.ComponentType<P>) =>
  /* eslint-disable indent */
  (props: P): JSX.Element => {
    const inputRef = React.useRef<Input>(null);

    useEffect(() => {
      if (!isNil(inputRef.current) && !isNil(inputRef.current.focus)) {
        inputRef.current.focus();
      }
    }, [inputRef.current]);
    return <Component {...props} ref={inputRef} />;
  };

/**
 * HOC for Form.Item that will auto focus the first child field if the field
 * is capable of being focused.
 */
const withFormItemFirstInputFocused =
  <P extends { children: JSX.Element[] | JSX.Element }>(Component: React.ComponentType<P>) =>
  /* eslint-disable indent */
  (props: P): JSX.Element => {
    const children = useMemo<JSX.Element[]>(() => {
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
      Input type.  However, that might not be what we want to do anyways...

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
          <AutoFocusInputComponent key={firstInputIndex} {...inputChildren[0].props} />,
          ...c.slice(firstInputIndex + 1)
        ];
      }
      return c;
    }, [props.children]);
    return <React.Fragment>{children}</React.Fragment>;
  };

const PrivateForm = <T extends { [key: string]: any } = any>(
  { globalError, initialValues, loading, children, className, style = {}, ...props }: PrivateFormProps<T>,
  ref: any
): JSX.Element => {
  const childrenArray = useMemo<JSX.Element[]>(() => {
    /*
    Under certain conditions, we want to auto focus the first field of a Form.
    We accomplish this by looking at the children of the first Form.Item child
    component and auto focusing the first child of the first Form.Item child component
    if it can be focused.

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

    // If the Form is being used inside of a modal, we focus the first field by default.
    // Otherwise, we do not focus the first field by default.
    const defaultAutoFocusFirstField = props.form.isInModal === true ? true : false;
    const autoFocusFirstField = !isNil(props.autoFocusFirstField)
      ? props.autoFocusFirstField
      : defaultAutoFocusFirstField;

    if (autoFocusFirstField === true) {
      const formItemChildren = filter(c, (ci: JSX.Element) => ci.type === RootForm.Item);
      if (formItemChildren.length !== 0) {
        const firstFormItemIndex = indexOf(c, formItemChildren[0]);
        const AutFocusFirstInputFormItemComponent = withFormItemFirstInputFocused(formItemChildren[0].type);
        c = [
          ...c.slice(0, firstFormItemIndex),
          <AutFocusFirstInputFormItemComponent key={firstFormItemIndex} {...formItemChildren[0].props} />,
          ...c.slice(firstFormItemIndex + 1)
        ];
      }
    }
    return c;
  }, [props.name, children]);

  const footer = useMemo<JSX.Element | undefined>(() => {
    return find(childrenArray, (child: JSX.Element) => child.type === Footer);
  }, [childrenArray]);

  return (
    <RootForm
      {...props}
      name={!isNil(props.name) ? props.name : props.form.isInModal === true ? "form_in_modal" : undefined}
      ref={ref}
      initialValues={initialValues}
      className={classNames(className, "form")}
      style={style}
    >
      <RenderWithSpinner loading={!isNil(props.form.loading) ? props.form.loading : loading}>
        {map(
          filter(childrenArray, (child: JSX.Element) => child.type !== Footer),
          (element: JSX.Element, index: number) => (
            <React.Fragment key={index}>{element}</React.Fragment>
          )
        )}
        <div className={"form-alert-wrapper"}>
          <Error>{(props.form && props.form.globalError) || globalError}</Error>
        </div>
        {!isNil(footer) && footer}
      </RenderWithSpinner>
    </RootForm>
  );
};

const Form = forwardRef(PrivateForm);

const exportable = {
  Form: Form,
  Error: Error,
  useForm: useForm,
  Footer: Footer,
  Item: RootForm.Item
};

export default exportable;
