import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { ShowHide } from "components/display";
import { AccountCircleLink } from "components/control/links";
import { isFieldAlterationEvent } from "model/typeguards";
import { toDisplayTimeSince } from "util/dates";

import "./Event.scss";
import React from "react";

interface FieldAlterationProps {
  event: FieldAlterationEvent;
}

interface EventProps {
  event: HistoryEvent;
}

interface ItemCreatedProps {
  event: CreateEvent;
}

const EventHeader = (props: { event: HistoryEvent }): JSX.Element => {
  return (
    <div className={"event-header"}>
      <AccountCircleLink user={props.event.user} />
      <div className={"event-user-name"}>{props.event.user.full_name}</div>
      <div className={"event-created-at"}>{toDisplayTimeSince(props.event.created_at)}</div>
    </div>
  );
};

const FieldChange = ({ event }: FieldAlterationProps): JSX.Element => {
  return (
    <div className={"event-body"}>
      <div className={"event-body-text"}>
        <span className={"darker mr"}>{event.user.full_name}</span>
        {"changed the value of"}
        <span className={"blue mr ml"}>{event.field}</span>
        {"from"}
        <span className={"bolder mr ml"}>{event.old_value}</span>
        <FontAwesomeIcon className={"arrow-change"} icon={faArrowRight} />
        {!isNil(event.content_object.identifier) && event.field !== "identifier" ? (
          <React.Fragment>
            <span className={"bolder ml mr"}>{event.new_value}</span>
            <ShowHide show={!isNil(event.content_object.identifier) && event.field !== "identifier"}>
              {"for"}
              <span className={"ml mr"}>{event.content_object.type}</span>
              <span className={"blue ml mr"}>{event.content_object.identifier}</span>
            </ShowHide>
          </React.Fragment>
        ) : (
          <span className={"bolder ml"}>{event.new_value}</span>
        )}
        {"."}
      </div>
    </div>
  );
};

const FieldAdd = ({ event }: FieldAlterationProps): JSX.Element => {
  return (
    <div className={"event-body"}>
      <div className={"event-body-text"}>
        <span className={"darker mr"}>{event.user.full_name}</span>
        {"added a value of"}
        <span className={"bolder ml mr"}>{event.new_value}</span>
        {"for"}
        <span className={"blue ml"}>{event.field}</span>
        {"."}
      </div>
    </div>
  );
};

const FieldRemove = ({ event }: FieldAlterationProps): JSX.Element => {
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

const FieldAlteration = ({ event }: FieldAlterationProps): JSX.Element => {
  return (
    <React.Fragment>
      <ShowHide show={!isNil(event.new_value) && !isNil(event.old_value)}>
        <FieldChange event={event} />
      </ShowHide>
      <ShowHide show={!isNil(event.new_value) && isNil(event.old_value)}>
        <FieldAdd event={event} />
      </ShowHide>
      <ShowHide show={isNil(event.new_value) && !isNil(event.old_value)}>
        <FieldRemove event={event} />
      </ShowHide>
    </React.Fragment>
  );
};

const ItemCreated = ({ event }: ItemCreatedProps): JSX.Element => {
  return (
    <div className={"event-body"}>
      <div className={"event-body-text"}>
        <span className={"darker mr"}>{event.user.full_name}</span>
        {"added"}
        {!isNil(event.content_object.identifier) ? (
          <span className={"bolder ml"}>{event.content_object.identifier}</span>
        ) : (
          <span className={"bolder ml"}>{event.content_object.type}</span>
        )}
        {"."}
      </div>
    </div>
  );
};

const Event = ({ event }: EventProps): JSX.Element => {
  return (
    <div className={"event"}>
      <EventHeader event={event} />
      {isFieldAlterationEvent(event) ? <FieldAlteration event={event} /> : <ItemCreated event={event} />}
    </div>
  );
};

export default Event;
