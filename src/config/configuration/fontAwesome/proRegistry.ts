/*
This file contains the icons that are used in the application when the FontAwesome license is in
use.  When additional icons are required, they should be imported in this file and added to the
`IconRegistry` array.
*/
import { faSlack } from "@fortawesome/free-brands-svg-icons";
import { faFileLines, faCircleQuestion } from "@fortawesome/pro-regular-svg-icons";
import {
  faArrowDown,
  faCircleNotch,
  faEllipsisH,
  faDatabase,
  faChartSimple,
  faCircleNodes,
  faShield,
  faUserGroup,
  faTriangleExclamation,
  faCircleCheck,
  faCircleExclamation,
  faXmark,
  faUserCircle,
  faBell,
  faChevronDown,
  faPencil,
  faPause,
  faArrowRotateLeft,
  faCircleStop,
  faPlay,
} from "@fortawesome/pro-solid-svg-icons";

export const PRO_ICON_REGISTRY = [
  faSlack,
  faArrowDown,
  faCircleNotch,
  faEllipsisH,
  faDatabase,
  faChartSimple,
  faCircleNodes,
  faShield,
  faUserGroup,
  faTriangleExclamation,
  faCircleExclamation,
  faCircleCheck,
  faFileLines,
  faCircleQuestion,
  faXmark,
  faUserCircle,
  faBell,
  faChevronDown,
  faPencil,
  faPause,
  faArrowRotateLeft,
  faCircleStop,
  faPlay,
] as const;
