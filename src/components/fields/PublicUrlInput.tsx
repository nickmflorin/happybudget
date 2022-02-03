import React, { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { isNil } from "lodash";

import { ShowHide } from "components";
import { IconButton } from "components/buttons";
import Input, { InputProps } from "./Input";

import "./PublicUrlInput.scss";

type PublicUrlInputProps = Omit<InputProps, "disabled" | "small" | "onChange"> & {
  readonly urlFormatter: (tokenId: string) => string;
  readonly value?: string;
  readonly allowRefresh?: boolean;
  readonly onChange?: (v: string) => void;
};

const PublicUrlInput = ({
  urlFormatter,
  value,
  allowRefresh,
  onChange,
  ...props
}: PublicUrlInputProps): JSX.Element => {
  const [_value, setValue] = useState<string>(value || uuidv4());

  const val = useMemo(() => (!isNil(value) ? value : _value), [value, _value]);

  return (
    <div className={"public-url-input-div"}>
      <Input {...props} small={true} disabled={true} value={`${process.env.REACT_APP_DOMAIN}${urlFormatter(val)}`} />
      <ShowHide show={allowRefresh !== false}>
        <IconButton
          icon={"refresh"}
          style={{ height: "auto", width: "auto", padding: 5 }}
          outersize={28}
          onClick={() => {
            const newV = uuidv4();
            setValue(newV);
            onChange?.(newV);
          }}
        />
      </ShowHide>
    </div>
  );
};

export default React.memo(PublicUrlInput);
