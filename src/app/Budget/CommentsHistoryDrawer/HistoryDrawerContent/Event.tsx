import React from "react";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { ShowHide } from "components/display";
import { AccountCircleLink } from "components/control/links";
import { SegmentedText } from "components/typography";
import { isFieldAlterationEvent } from "model/typeguards";
import { toDisplayTimeSince } from "util/dates";

import "./Event.scss";

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
    <SegmentedText suffix={"."}>
      <SegmentedText.Segment dark>{event.user.full_name}</SegmentedText.Segment>
      <SegmentedText.Segment>{"changed the value of"}</SegmentedText.Segment>
      <SegmentedText.Segment blue>{event.field}</SegmentedText.Segment>
      <SegmentedText.Segment>{"from"}</SegmentedText.Segment>
      <SegmentedText.Segment bold>{event.old_value}</SegmentedText.Segment>
      <FontAwesomeIcon className={"arrow-change"} icon={faArrowRight} />
      {!isNil(event.content_object.identifier) && event.field !== "identifier" ? (
        <SegmentedText>
          <SegmentedText.Segment bold>{event.new_value}</SegmentedText.Segment>
          <SegmentedText show={!isNil(event.content_object.identifier) && event.field !== "identifier"}>
            <SegmentedText.Segment>{"for"}</SegmentedText.Segment>
            <SegmentedText.Segment>{event.content_object.type}</SegmentedText.Segment>
            <SegmentedText.Segment blue>{event.content_object.identifier}</SegmentedText.Segment>
          </SegmentedText>
        </SegmentedText>
      ) : (
        <SegmentedText.Segment bold>{event.new_value}</SegmentedText.Segment>
      )}
    </SegmentedText>
  );
};

const FieldAdd = ({ event }: FieldAlterationProps): JSX.Element => {
  return (
    <SegmentedText suffix={"."}>
      <SegmentedText.Segment dark>{event.user.full_name}</SegmentedText.Segment>
      <SegmentedText.Segment>{"added a value of"}</SegmentedText.Segment>
      <SegmentedText.Segment bold>{event.new_value}</SegmentedText.Segment>
      <SegmentedText.Segment>{"for"}</SegmentedText.Segment>
      <SegmentedText.Segment bold>{event.field}</SegmentedText.Segment>
    </SegmentedText>
  );
};

const FieldRemove = ({ event }: FieldAlterationProps): JSX.Element => {
  return (
    <SegmentedText suffix={"."}>
      <SegmentedText.Segment dark>{event.user.full_name}</SegmentedText.Segment>
      <SegmentedText.Segment>{"removed the value of"}</SegmentedText.Segment>
      <SegmentedText.Segment bold>{event.field}</SegmentedText.Segment>
    </SegmentedText>
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
    <SegmentedText suffix={"."}>
      <SegmentedText.Segment dark>{event.user.full_name}</SegmentedText.Segment>
      <SegmentedText.Segment>{"added"}</SegmentedText.Segment>
      <SegmentedText.Segment blue>{event.content_object.type}</SegmentedText.Segment>
      <SegmentedText.Segment bold>{event.content_object.identifier}</SegmentedText.Segment>
    </SegmentedText>
  );
};

const Event = ({ event }: EventProps): JSX.Element => {
  return (
    <div className={"event"}>
      <EventHeader event={event} />
      <div className={"event-body"}>
        <div className={"event-body-text"}>
          {isFieldAlterationEvent(event) ? <FieldAlteration event={event} /> : <ItemCreated event={event} />}
        </div>
      </div>
    </div>
  );
};

export default Event;
