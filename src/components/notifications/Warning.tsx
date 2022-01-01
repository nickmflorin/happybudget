import React from "react";
import Notification, { NoticationComponentProps } from "./Notification";

export type WarningProps = Omit<NoticationComponentProps, "level">;

const Warning: React.FC<WarningProps> = props => <Notification {...props} level={"warning"} />;

export default React.memo(Warning);
