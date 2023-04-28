import classNames from "classnames";

import * as ui from "lib/ui";
import { icons } from "lib/ui";

import { BodyText, BodyTextProps } from "./BodyText";

const copyrightText = process.env.NEXT_PUBLIC_COPYRIGHT_TEXT;

export type CopyrightTextProps = ui.ComponentProps & Omit<BodyTextProps, "icon" | "children">;

export const CopyrightText = (props: CopyrightTextProps) =>
  copyrightText !== undefined ? (
    <BodyText
      level={1}
      {...props}
      className={classNames("copyright-text", props.className)}
      icon={icons.IconNames.COPYRIGHT}
    >
      {copyrightText}
    </BodyText>
  ) : (
    <></>
  );
