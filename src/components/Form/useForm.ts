import { useMemo, useRef } from "react";
import { isNil, forEach, find } from "lodash";
import { Form as RootForm, FormInstance } from "antd";
import { ClientError, NetworkError, parseGlobalError, parseFieldErrors, standardizeError } from "api";
import { replaceInArray } from "lib/util";

type ExtendedForm = FormInstance & {
  handleRequestError: (e: Error) => void;
  renderFieldErrors: (e: ClientError) => void;
  setGlobalError: (e: string) => void;
  setLoading: (value: boolean) => void;
};

const useForm = (form?: ExtendedForm | undefined) => {
  const _useAntdForm = RootForm.useForm();
  const antdForm = _useAntdForm[0];

  const globalError = useRef<string | undefined>(undefined);
  const loading = useRef<boolean | undefined>(false);

  const setGlobalError = (value: string | undefined) => {
    globalError.current = value;
  };

  const setLoading = (value: boolean) => {
    loading.current = value;
  };

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

  var wrapForm = useMemo(() => {
    return {
      ...antdForm,
      submit: () => {
        globalError.current = undefined;
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
            globalError.current = global.message;
          }
          // Render the errors for each field next to the form field.
          renderFieldErrors(e);
        } else if (e instanceof NetworkError) {
          setGlobalError("There was a problem communicating with the server.");
        } else {
          throw e;
        }
      },
      globalError
    };
  }, [form, antdForm]);
  return [wrapForm];
};

export default useForm;
