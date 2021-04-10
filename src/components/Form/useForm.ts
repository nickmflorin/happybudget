import { useMemo, useRef } from "react";
import { Form as RootForm, FormInstance } from "antd";

type ExtendedForm = FormInstance & {
  test: (value: string) => void;
};

const useForm = (form?: ExtendedForm | undefined) => {
  const _useAntdForm = RootForm.useForm();
  const antdForm = _useAntdForm[0];

  const globalError = useRef<string | undefined>(undefined);

  var wrapForm = useMemo(() => {
    return {
      ...antdForm,
      test: (value: string) => {
        console.log("SETTING GLOBAL ERROR");
        globalError.current = value;
      },
      globalError
    };
  }, [form, antdForm]);
  return [wrapForm];
};

export default useForm;
