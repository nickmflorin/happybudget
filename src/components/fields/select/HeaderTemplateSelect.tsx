import { useEffect, useState, useImperativeHandle, useMemo } from "react";
import { filter } from "lodash";

import * as api from "api";
import { http, ui } from "lib";

import { SingleModelSyncSelect, SingleModelSyncSelectProps } from "./generic";

export type HeaderTemplateSelectProps = Omit<
  SingleModelSyncSelectProps<Model.SimpleHeaderTemplate>,
  "loadOptions" | "getOptionLabel" | "noOptionsMessage" | "components" | "onChange" | "options" | "select" | "onChange"
> & {
  readonly select?: NonNullRef<HeaderTemplateSelectInstance>;
  readonly onDeleted?: (id: number) => void;
  readonly onChange: (m: Model.HeaderTemplate | null) => void;
};

const HeaderTemplateSelect = ({ onDeleted, ...props }: HeaderTemplateSelectProps): JSX.Element => {
  const [cancelToken] = http.useCancelToken();
  const select = ui.select.useHeaderTemplateSelectIfNotDefined(props.select);
  const [options, setOptions] = useState<Model.SimpleHeaderTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(select, () => ({
    ...select.current,
    addOption: (m: Model.HeaderTemplate | Model.SimpleHeaderTemplate) => {
      setOptions([...options, m]);
    }
  }));

  useEffect(() => {
    api
      .getHeaderTemplates({}, { cancelToken: cancelToken() })
      .then((rsp: Http.ListResponse<Model.SimpleHeaderTemplate>) => {
        setLoading(false);
        setOptions(rsp.data);
      })
      .catch((e: Error) => {
        setLoading(false);
        select.current.handleRequestError(e);
      });
  }, []);

  const _onChange = useMemo(
    () => (id: number | null) => {
      if (id === null) {
        props.onChange(id);
      } else {
        setLoading(true);
        api
          .getHeaderTemplate(id, { cancelToken: cancelToken() })
          .then((m: Model.HeaderTemplate) => {
            setLoading(false);
            props.onChange(m);
          })
          .catch((e: Error) => {
            setLoading(false);
            select.current.handleRequestError(e);
          });
      }
    },
    [props.onChange]
  );

  return (
    <SingleModelSyncSelect
      {...props}
      select={select}
      options={options}
      isSearchable={false}
      isClearable={true}
      isLoading={loading}
      placeholder={"Select header template..."}
      getOptionLabel={(m: Model.SimpleHeaderTemplate) => m.name}
      onChange={_onChange}
      onDelete={(m: Model.SimpleHeaderTemplate, setDeleting: (v: boolean) => void) => {
        setDeleting(true);
        api
          .deleteHeaderTemplate(m.id)
          .then(() => {
            setDeleting(false);
            setOptions(filter(options, (o: Model.SimpleHeaderTemplate) => o.id !== m.id));
            onDeleted?.(m.id);
          })
          .catch((e: Error) => {
            setDeleting(false);
            select.current.handleRequestError(e);
          });
      }}
    />
  );
};

export default HeaderTemplateSelect;
