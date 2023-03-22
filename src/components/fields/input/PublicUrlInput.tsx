import React, { useState, useMemo } from "react";

import { isNil, includes } from "lodash";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { util } from "lib";
import { ShowHide } from "components";
import { IconButton } from "components/buttons";
import * as config from "application/config";

import Input, { InputProps } from "./Input";

type PublicUrlAction = "refresh" | "copy" | "visit";

type PublicUrlInputProps = Omit<InputProps, "disabled" | "small" | "onChange"> & {
  readonly urlFormatter: (tokenId: string) => string;
  readonly value?: string;
  readonly actions?: PublicUrlAction[];
  readonly onChange?: (v: string) => void;
};

const PublicUrlInput = ({
  urlFormatter,
  value,
  actions,
  onChange,
  ...props
}: PublicUrlInputProps): JSX.Element => {
  const [_value, setValue] = useState<string>(value || uuidv4());
  const history = useHistory();
  const val = useMemo(() => (!isNil(value) ? value : _value), [value, _value]);

  return (
    <div className="public-url-input">
      <Input
        {...props}
        small={true}
        disabled={true}
        size="small"
        value={`${config.env.APP_DOMAIN}${urlFormatter(val)}`}
      />
      <div className="public-url-actions">
        <ShowHide show={includes(actions, "refresh")}>
          <IconButton
            size="small"
            iconSize="small"
            icon="refresh"
            onClick={() => {
              const newV = uuidv4();
              setValue(newV);
              onChange?.(newV);
            }}
          />
        </ShowHide>
        <ShowHide show={includes(actions, "copy")}>
          <IconButton
            size="small"
            iconSize="small"
            icon="link"
            onClick={() =>
              util.clipboard.copyTextToClipboard(
                `${config.env.APP_DOMAIN}${urlFormatter(val)}`,
                undefined,
                (e: Error | string) => {
                  console.error(e);
                },
              )
            }
          />
        </ShowHide>
        <ShowHide show={includes(actions, "visit")}>
          <IconButton
            size="small"
            iconSize="small"
            icon="square-arrow-up-right"
            onClick={() => history.push(urlFormatter(val))}
          />
        </ShowHide>
      </div>
    </div>
  );
};

export default React.memo(PublicUrlInput);
