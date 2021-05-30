import { useMemo, useState } from "react";
import { isNil, forEach, find } from "lodash";
import { Form as RootForm } from "antd";
import { ClientError, NetworkError, parseGlobalError, parseFieldErrors, standardizeError } from "api";
import { replaceInArray } from "lib/util";
import { FormInstance } from "./model";

const useForm = <T extends { [key: string]: any } = { [key: string]: any }>(form?: FormInstance<T> | undefined) => {
  const _useAntdForm = RootForm.useForm();
  const antdForm = _useAntdForm[0];

  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);

  const renderFieldErrors = (e: ClientError) => {
    let fieldsWithErrors: { name: string; errors: string[] }[] = [];
    forEach(parseFieldErrors(e), (error: Http.FieldError) => {
      const existing = find(fieldsWithErrors, { name: error.field });
      if (!isNil(existing)) {
        fieldsWithErrors = replaceInArray<{ name: string; errors: string[] }>(
          fieldsWithErrors,
          { name: error.field },
          { ...existing, errors: [...existing.errors, standardizeError(error).message] }
        );
      } else {
        fieldsWithErrors.push({ name: error.field, errors: [standardizeError(error).message] });
      }
    });
    antdForm.setFields(fieldsWithErrors);
  };

  const wrapForm = useMemo(() => {
    return {
      ...antdForm,
      submit: () => {
        setGlobalError(undefined);
        antdForm.submit();
      },
      resetFields: () => {
        setGlobalError(undefined);
        antdForm.resetFields();
      },
      setLoading,
      setGlobalError: setGlobalError,
      renderFieldErrors: renderFieldErrors,
      handleRequestError: (e: Error) => {
        if (e instanceof ClientError) {
          const global = parseGlobalError(e);
          if (!isNil(global)) {
            /* eslint-disable no-console */
            console.error(e.errors);
            setGlobalError(global.message);
          }
          // Render the errors for each field next to the form field.
          renderFieldErrors(e);
        } else if (e instanceof NetworkError) {
          setGlobalError("There was a problem communicating with the server.");
        } else {
          throw e;
        }
      },
      globalError,
      loading
    };
  }, [form, antdForm, globalError, loading]);
  return [wrapForm];
};

export default useForm;
