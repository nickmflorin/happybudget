import React from "react";
import Notification, { NoticationComponentProps } from "./Notification";

export type InfoProps = Omit<NoticationComponentProps, "level">;

const Info: React.FC<InfoProps> = props => <Notification {...props} level={"info"} />;

export default React.memo(Info);
