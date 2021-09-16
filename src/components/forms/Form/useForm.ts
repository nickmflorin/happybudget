import { useMemo, useState } from "react";
import axios from "axios";
import { isNil, forEach, find } from "lodash";
import { Form as RootForm } from "antd";
import * as api from "api";
import { util } from "lib";

const useForm = <T>(form?: Partial<FormInstance<T>> | undefined) => {
  const _useAntdForm = RootForm.useForm();
  const antdForm = _useAntdForm[0];

  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);

  const renderFieldErrors = (e: api.ClientError) => {
    let fieldsWithErrors: { name: string; errors: string[] }[] = [];
    forEach(api.parseFieldErrors(e), (error: Http.FieldError) => {
      const existing = find(fieldsWithErrors, { name: error.field });
      if (!isNil(existing)) {
        fieldsWithErrors = util.replaceInArray<{ name: string; errors: string[] }>(
          fieldsWithErrors,
          { name: error.field },
          { ...existing, errors: [...existing.errors, api.standardizeError(error).message] }
        );
      } else {
        fieldsWithErrors.push({ name: error.field, errors: [api.standardizeError(error).message] });
      }
    });
    antdForm.setFields(fieldsWithErrors);
  };

  const wrapForm = useMemo<FormInstance<T>>(() => {
    return {
      ...antdForm,
      autoFocusField: form?.autoFocusField,
      submit: () => {
        setGlobalError(undefined);
        antdForm.submit();
      },
      resetFields: () => {
        setGlobalError(undefined);
        antdForm.resetFields();
      },
      setLoading,
      setGlobalError: (e: Error | string | undefined) => {
        if (!isNil(e)) {
          if (typeof e === "string") {
            setGlobalError(e);
          } else {
            setGlobalError(!isNil(e.message) ? e.message : `${e}`);
          }
        } else {
          setGlobalError(undefined);
        }
      },
      renderFieldErrors: renderFieldErrors,
      handleRequestError: (e: Error) => {
        if (!axios.isCancel(e)) {
          if (e instanceof api.ClientError) {
            const global = api.parseGlobalError(e);
            if (!isNil(global)) {
              /* eslint-disable no-console */
              console.error(e.errors);
              setGlobalError(global.message);
            }
            // Render the errors for each field next to the form field.
            renderFieldErrors(e);
          } else if (e instanceof api.NetworkError) {
            setGlobalError("There was a problem communicating with the server.");
          } else if (e instanceof api.ServerError) {
            /* eslint-disable no-console */
            console.error(e);
            setGlobalError("There was a problem communicating with the server.");
          } else {
            throw e;
          }
        }
      },
      globalError,
      loading,
      ...form
    };
  }, [form, antdForm, globalError, loading]);
  return [wrapForm];
};

export default useForm;
