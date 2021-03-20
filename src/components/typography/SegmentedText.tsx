import { ReactNode } from "react";
import classNames from "classnames";
import { map, isNil } from "lodash";
import "./SegmentedText.scss";

interface ITextSegment {
  children: ReactNode;
  className?: string[] | string;
  bold?: boolean;
  blue?: boolean;
  dark?: boolean;
  color?: string;
}

export const TextSegment = ({ children, className, bold, blue, dark, color }: ITextSegment): JSX.Element => {
  if (isNil(children)) {
    return <></>;
  }
  return (
    <span
      style={{ color: color }}
      className={classNames("segment", className, {
        dark,
        bold,
        blue
      })}
    >
      {children}
    </span>
  );
};

interface SegmentedTextProps extends StandardComponentProps {
  children: JSX.Element[];
  spacing?: number;
  show?: boolean;
  suffix?: string;
}

const SegmentedText = ({
  className,
  style = {},
  spacing = 1,
  show = true,
  suffix,
  children
}: SegmentedTextProps): JSX.Element => {
  if (show === true) {
    return (
      <span className={classNames("segmented-text", className)} style={style}>
        {map(children, (child: JSX.Element, index: number) => {
          return (
            <span
              style={{
                marginLeft: index !== 0 ? spacing : 0,
                marginRight: index !== children.length - 1 ? spacing : 0
              }}
              className={classNames("segment-wrapper")}
            >
              {child}
            </span>
          );
        })}
        {!isNil(suffix) && suffix}
      </span>
    );
  }
  return <></>;
};

SegmentedText.Segment = TextSegment;
export default SegmentedText;
