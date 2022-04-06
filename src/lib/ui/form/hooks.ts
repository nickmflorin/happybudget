import { useState, useMemo } from "react";
import { isNil, find, reduce, map } from "lodash";
import { Form as RootForm } from "antd";

import { util, ui, notifications } from "lib";

export const useForm = <T>(form?: Partial<FormInstance<T>> | undefined): FormInstance<T> => {
  const _useAntdForm = RootForm.useForm();
  const antdForm = _useAntdForm[0];
  const isMounted = ui.useIsMounted();

  const [loading, setLoading] = useState<boolean | undefined>(undefined);

  const handleFieldErrors = useMemo(
    () => (errors: UIFieldNotification[]) => {
      const fieldsWithErrors = reduce(
        errors,
        (curr: FieldWithErrors[], e: UIFieldNotification): FieldWithErrors[] => {
          const existing = find(curr, { name: e.field });
          if (!isNil(existing)) {
            return util.replaceInArray<FieldWithErrors>(
              curr,
              { name: e.field },
              { ...existing, errors: [...existing.errors, e.message] }
            );
          } else {
            return [...curr, { name: e.field, errors: [e.message] }];
          }
        },
        []
      );
      antdForm.setFields(fieldsWithErrors);
    },
    [antdForm.setFields]
  );

  const NotificationsHandler = notifications.ui.useNotificationsManager({
    handleFieldErrors,
    defaultBehavior: "replace",
    defaultClosable: false
  });

  const clearFieldErrors = useMemo(
    () => () => {
      /* Unfortunately, AntD does not provide a way to do this directly (or to
         iterate over the fields in the Form for that matter).  So we have to
         reset the fields without any errors to get field level error messages
         to go away. */
      const currentFields = antdForm.getFieldsValue();
      antdForm.setFields(
        map(Object.keys(currentFields), (key: string) => ({ name: key, value: currentFields[key], errors: [] }))
      );
    },
    []
  );

  const clearNotifications = useMemo(
    () => (ids?: SingleOrArray<number>) => {
      NotificationsHandler.clearNotifications(ids);
      clearFieldErrors();
    },
    []
  );

  const wrapForm = useMemo<FormInstance<T>>(() => {
    return {
      ...antdForm,
      autoFocusField: form?.autoFocusField,
      ...NotificationsHandler,
      clearFieldErrors,
      clearNotifications,
      submit: () => {
        clearNotifications();
        antdForm.submit();
      },
      resetFields: () => {
        clearNotifications();
        antdForm.resetFields();
      },
      setLoading: (v: boolean) => {
        /* Only change the state if the Form is still mounted - otherwise we
           introduce a memory leak.  This can happen often in Modals where
           the onSuccess callback is triggered and the modal is closed before
           form.setLoading(false) is called. */
        if (isMounted.current) {
          setLoading(v);
        }
      },
      loading,
      ...form
    };
  }, [form, antdForm, loading, NotificationsHandler]);

  return wrapForm;
};

export const useFormIfNotDefined = <T>(
  options?: Partial<FormInstance<T>> | undefined,
  form?: FormInstance<T>
): FormInstance<T> => {
  const newForm = useForm(options);
  return useMemo(() => (!isNil(form) ? form : newForm), [form, newForm]);
};
