import React from "react";
import Notification, { NoticationComponentProps } from "./Notification";

export type ErrorProps = Omit<NoticationComponentProps, "level">;

const Error: React.FC<ErrorProps> = props => <Notification {...props} level={"error"} />;

export default React.memo(Error);
