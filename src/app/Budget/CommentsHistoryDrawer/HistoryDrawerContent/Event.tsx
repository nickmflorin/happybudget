import { isNil } from "lodash";

import { ShowHide } from "components/display";
import { AccountCircleLink } from "components/control/links";
import { toDisplayTimeSince } from "util/dates";

import "./Event.scss";

const EventHeader = (props: { event: IFieldAlterationEvent }): JSX.Element => {
  return (
    <div className={"event-header"}>
      <AccountCircleLink user={props.event.user} />
      <div className={"event-user-name"}>{props.event.user.full_name}</div>
      <div className={"event-created-at"}>{toDisplayTimeSince(props.event.created_at)}</div>
    </div>
  );
};

interface EventBodyProps {
  event: IFieldAlterationEvent;
}

const FieldChange = ({ event }: EventBodyProps): JSX.Element => {
  return (
    <div className={"event-body"}>
      <div className={"event-body-text"}>
        <span className={"darker mr"}>{event.user.full_name}</span>
        {"changed the value of"}
        <span className={"bolder mr ml"}>{event.field}</span>
        {"from"}
        <span className={"bolder mr ml"}>{event.old_value}</span>
        {"to"}
        <span className={"bolder ml"}>{event.new_value}</span>
        {"."}
      </div>
    </div>
  );
};

const FieldAdd = ({ event }: EventBodyProps): JSX.Element => {
  return (
    <div className={"event-body"}>
      <div className={"event-body-text"}>
        <span className={"darker mr"}>{event.user.full_name}</span>
        {"added a value of"}
        <span className={"bolder ml mr"}>{event.new_value}</span>
        {"for"}
        <span className={"bolder ml"}>{event.field}</span>
        {"."}
      </div>
    </div>
  );
};

const FieldRemove = ({ event }: EventBodyProps): JSX.Element => {
  return (
    <div className={"event-body"}>
      <div className={"event-body-text"}>
        <span className={"darker mr"}>{event.user.full_name}</span>
        {"removed the value of"}
        <span className={"bolder ml"}>{event.field}</span>
        {"."}
      </div>
    </div>
  );
};

interface EventProps {
  event: IFieldAlterationEvent;
}

const Event = ({ event }: EventProps): JSX.Element => {
  return (
    <div className={"event"}>
      <EventHeader event={event} />
      <ShowHide show={!isNil(event.new_value) && !isNil(event.old_value)}>
        <FieldChange event={event} />
      </ShowHide>
      <ShowHide show={!isNil(event.new_value) && isNil(event.old_value)}>
        <FieldAdd event={event} />
      </ShowHide>
      <ShowHide show={isNil(event.new_value) && !isNil(event.old_value)}>
        <FieldRemove event={event} />
      </ShowHide>
    </div>
  );
};

export default Event;
