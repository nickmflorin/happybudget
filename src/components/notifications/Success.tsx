import React from "react";
import Notification, { NoticationComponentProps } from "./Notification";

export type SuccessProps = Omit<NoticationComponentProps, "level">;

const Success: React.FC<SuccessProps> = props => <Notification {...props} level={"success"} />;

export default React.memo(Success);
