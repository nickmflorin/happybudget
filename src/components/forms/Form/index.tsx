import React, { useEffect, forwardRef, useMemo } from "react";
import { filter, isNil, find, indexOf, map } from "lodash";
import classNames from "classnames";

import { Form as RootForm, Input } from "antd";

import { RenderWithSpinner } from "components";
import { ui } from "lib";

import FormNotification from "./Notification";
import FieldError from "./FieldError";
import Footer from "./Footer";
import FormItemStyle from "./FormItemStyle";
import FormItemSection from "./FormItemSection";
import FormItemComp from "./FormItem";
import FormLabel from "./FormLabel";
import FormColumnItem from "./FormColumnItem";

interface PrivateFormProps<T = any> extends FormProps<T> {
  children: JSX.Element[] | JSX.Element;
}

const isChangeEvent = (e: React.ChangeEvent<any> | any): e is React.ChangeEvent<any> => {
  return (e as React.ChangeEvent<any>).target !== undefined;
};

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
    }, [isNil(inputRef.current)]);
    return <Component {...props} ref={inputRef} autoFocus={true} />;
  };

/**
 * HOC for Form.Item that will auto focus the first child field if the field
 * is capable of being focused.
 */
const withFormItemFirstInputFocused = <
  T extends { [key: string]: any },
  P extends { children: JSX.Element[] | JSX.Element; name: string } = {
    children: JSX.Element[] | JSX.Element;
    name: string;
    [key: string]: any;
  }
>(
  Component: React.ComponentType<P>,
  formProps: Omit<PrivateFormProps<T>, "globalError" | "loading" | "children">
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
            // We have to manually set the defaultValue because AntD will not apply it
            // since we are messing with the AntD form mechanics here.
            defaultValue={
              !isNil(formProps.initialValues) && !isNil(props.name) ? formProps.initialValues[props.name] : undefined
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement> | number) => {
              /*
              This is necessary in order to get changes to the fields of the <Form.Item>
              to reflect in the Form data.  Normally, AntD handles this for us - but since
              we are messing with the Form.Item structure here, we have to do it ourselves.

              Because this onChange handler can be used for many different input types, the
              event may or may not be a traditional React.ChangeEvent.  For example, if the
              input element is a Select component, the event will just be the value of the
              chosen Select.Option.

              We could restrict the behavior to only apply to children input elements of
              type <Input />, but that does not seem to be possible due to uses of
              forwardRef (see above explanation).
              */
              const value = isChangeEvent(e) ? e.target.value : e;
              if (!isNil(props.name)) {
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

const PrivateForm = <T extends { [key: string]: any } = any>(
  { globalError, loading, children, autoFocusField, ...props }: PrivateFormProps<T>,
  ref: any
): JSX.Element => {
  const firstRender = ui.hooks.useTrackFirstRender();
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
    const propAutoFocusField = !isNil(autoFocusField) ? autoFocusField : props.form.autoFocusField;
    const useAutoFocusField = !isNil(propAutoFocusField) ? propAutoFocusField : defaultAutoFocusFirstField;

    // We cannot use the HOC components after the first render.  This is because AntD always rerenders
    // the entire form when a field changes, so whenever we would change another field, it would auto
    // focus the other field designated by `autoFocusField` again.  However, we cannot use an empty
    // array for the dependency array of this useEffect, because then the Form.Item(s) would not
    // update appropriately when props change.
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
            let newComponent = (
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
            let newComponent = (
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
      name={!isNil(props.name) ? props.name : props.form.isInModal === true ? "form_in_modal" : undefined}
      ref={ref}
      className={classNames(props.className, "form")}
    >
      <RenderWithSpinner loading={!isNil(props.form.loading) ? props.form.loading : loading}>
        {map(
          filter(childrenArray, (child: JSX.Element) => child.type !== Footer),
          (element: JSX.Element, index: number) => (
            <React.Fragment key={index}>{element}</React.Fragment>
          )
        )}
        <div className={"form-alert-wrapper"}>
          {!isNil(props.form?.renderedNotification) && props.form?.renderedNotification}
          {isNil(props.form?.renderedNotification) && (
            <FormNotification>{(props.form && props.form.globalError) || globalError}</FormNotification>
          )}
        </div>
        {!isNil(footer) && footer}
      </RenderWithSpinner>
    </RootForm>
  );
};

const Form = forwardRef(PrivateForm);

export { default as FormNotification } from "./Notification";

const exportable = {
  Form: Form,
  Notification: FormNotification,
  FieldError: FieldError,
  Footer: Footer,
  Item: FormItemComp,
  ColumnItem: FormColumnItem,
  ItemStyle: FormItemStyle,
  ItemSection: FormItemSection,
  Label: FormLabel
};

export default exportable;
