import { useEffect, useCallback, Fragment } from "react";
import { Typography } from "@mui/material";
import {
  format,
  eachMinuteOfInterval,
  isToday,
  setHours,
  setMinutes,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  addDays,
  addMinutes,
} from "date-fns";
import TodayTypo from "../components/common/TodayTypo";
import EventItem from "../components/events/EventItem";
import { CellRenderedProps, DayHours, DefaultRecourse, ProcessedEvent } from "../types";
import {
  calcCellHeight,
  calcMinuteHeight,
  filterMultiDaySlot,
  filterTodayEvents,
  getResourcedEvents,
} from "../helpers/generals";

import { WithResourcesHeader } from "../components/common/WithResourcesHeader";

import { WithResources } from "../components/common/WithResources";
import Cell from "../components/common/Cell";
import TodayEvents from "../components/events/TodayEvents";
import { TableGrid, TableGridHeader } from "../styles/styles";
import { MULTI_DAY_EVENT_HEIGHT } from "../helpers/constants";
import useSyncScroll from "../hooks/useSyncScroll";
import useStore from "../hooks/useStore";

export interface DayNewProps {
  startHour: DayHours;
  endHour: DayHours;
  step: number;
  cellRenderer?(props: CellRenderedProps): JSX.Element;
  headRenderer?(day: Date): JSX.Element;
  navigation?: boolean;
}

const DayNew = () => {
  const {
    day,
    selectedDate,
    events,
    height,
    getRemoteEvents,
    triggerLoading,
    handleState,
    resources,
    resourceFields,
    resourceViewMode,
    fields,
    direction,
    locale,
    hourFormat,
    timeZone,
  } = useStore();

  const { startHour, endHour, step, cellRenderer, headRenderer } = day!;
  const START_TIME = setMinutes(setHours(selectedDate, startHour), 0);
  const END_TIME = setMinutes(setHours(selectedDate, endHour), 0);
  const hours = eachMinuteOfInterval(
    {
      start: START_TIME,
      end: END_TIME,
    },
    { step: step }
  );
  const CELL_HEIGHT = calcCellHeight(height, hours.length);
  const MINUTE_HEIGHT = calcMinuteHeight(CELL_HEIGHT, step);
  const hFormat = hourFormat === "12" ? "h  a" : "HH:mm";
  const { headersRef, bodyRef } = useSyncScroll();

  const fetchEvents = useCallback(async () => {
    try {
      triggerLoading(true);
      const start = addDays(START_TIME, -1);
      const end = addDays(END_TIME, 1);
      const events = await getRemoteEvents!({
        start,
        end,
        view: "day",
      });
      if (events && events?.length) {
        handleState(events, "events");
      }
    } catch (error) {
      throw error;
    } finally {
      triggerLoading(false);
    }
    // eslint-disable-next-line
  }, [selectedDate, getRemoteEvents]);

  useEffect(() => {
    if (getRemoteEvents instanceof Function) {
      fetchEvents();
    }
  }, [fetchEvents, getRemoteEvents]);

  const renderMultiDayEvents = (multiDays: ProcessedEvent[]) => {
    const todayMulti = filterMultiDaySlot(multiDays, selectedDate, timeZone);
    return (
      <div className="rs__block_col" style={{ height: MULTI_DAY_EVENT_HEIGHT * multiDays.length }}>
        {todayMulti.map((event, i) => {
          const hasPrev = isBefore(event.start, startOfDay(selectedDate));
          const hasNext = isAfter(event.end, endOfDay(selectedDate));
          return (
            <div
              key={event.event_id}
              className="rs__multi_day"
              style={{
                top: i * MULTI_DAY_EVENT_HEIGHT,
                width: "99.9%",
                overflowX: "hidden",
              }}
            >
              <EventItem event={event} multiday hasPrev={hasPrev} hasNext={hasNext} />
            </div>
          );
        })}
      </div>
    );
  };

  const renderHeaderTable = (resource?: DefaultRecourse, index?: number) => {
    let recousedEvents = events;
    if (resource) {
      recousedEvents = getResourcedEvents(events, resource, resourceFields, fields);
    }

    // Equalizing multi-day section height
    const dynheader = index === 0 ? true : false;
    const shouldEqualize = resources.length && resourceViewMode !== "tabs";
    const allWeekMulti = filterMultiDaySlot(
      shouldEqualize ? events : recousedEvents,
      selectedDate,
      timeZone
    );
    const headerHeight = MULTI_DAY_EVENT_HEIGHT * allWeekMulti.length + 45;
    return (
      <>
        {/* Header */}
        <TableGridHeader days={1} ref={headersRef} sticky="1">
          <span className="rs__cell"></span>
          <span
            className={`rs__cell rs__header ${isToday(selectedDate) ? "rs__today_cell" : ""}`}
            style={{ height: headerHeight }}
          >
            {/* {typeof headRenderer === "function" ? (
              <div>{headRenderer(selectedDate)}</div>
            ) : (
              <TodayTypo date={selectedDate} locale={locale} />
            )}
            {renderMultiDayEvents(recousedEvents)} */}
          </span>
        </TableGridHeader>

        <TableGridHeader days={1}>
          {hours.map((h, i) => {
            return (
              <Fragment key={i}>
                <span className="rs__cell rs__header rs__time" style={{ height: CELL_HEIGHT }}>
                  <TimeHeader value={format(h, hFormat, { locale })}></TimeHeader>
                </span>
              </Fragment>
            );
          })}
        </TableGridHeader>

        {/* <TableGrid days={1} ref={bodyRef}>
  
          {hours.map((h, i) => {
            const start = new Date(`${format(selectedDate, "yyyy/MM/dd")} ${format(h, hFormat)}`);
            const end = new Date(
              `${format(selectedDate, "yyyy/MM/dd")} ${format(addMinutes(h, step), hFormat)}`
            );
            const field = resourceFields.idField;

            return (
              <Fragment key={i}>
               
                <span className="rs__cell rs__header rs__time" style={{ height: CELL_HEIGHT }}>
                 
                    <TimeHeader value={format(h, hFormat, { locale })}></TimeHeader>
             
                </span>

                <span className={`rs__cell ${isToday(selectedDate) ? "rs__today_cell" : ""}`}>
                 
                  {i === 0 && (
                    <TodayEvents
                      todayEvents={filterTodayEvents(recousedEvents, selectedDate, timeZone)}
                      today={START_TIME}
                      minuteHeight={MINUTE_HEIGHT}
                      startHour={startHour}
                      step={step}
                      direction={direction}
                    />
                  )}
            
                  <Cell
                    start={start}
                    end={end}
                    day={selectedDate}
                    height={CELL_HEIGHT}
                    resourceKey={field}
                    resourceVal={resource ? resource[field] : null}
                    cellRenderer={cellRenderer}
                  />
                </span>
              </Fragment>
            );
          })}
        </TableGrid> */}
      </>
    );
  };

  const renderTable = (resource?: DefaultRecourse, index?: number) => {
    let recousedEvents = events;
    if (resource) {
      recousedEvents = getResourcedEvents(events, resource, resourceFields, fields);
    }

    // Equalizing multi-day section height
    const dynheader = index === 0 ? true : false;
    const shouldEqualize = resources.length && resourceViewMode !== "tabs";
    const allWeekMulti = filterMultiDaySlot(
      shouldEqualize ? events : recousedEvents,
      selectedDate,
      timeZone
    );
    const headerHeight = MULTI_DAY_EVENT_HEIGHT * allWeekMulti.length + 45;
    return (
      <>
        {/* Header */}
        <TableGrid days={1} ref={headersRef} sticky="1">
          <span className="rs__cell" style={{ background: "#E6E6E6" }}></span>
          <span
            className={`rs__cell rs__header ${isToday(selectedDate) ? "rs__today_cell" : ""}`}
            style={{ height: headerHeight, background: "#E6E6E6" }}
          >
            {typeof headRenderer === "function" ? (
              <div>{headRenderer(selectedDate)}</div>
            ) : (
              <TodayTypo date={selectedDate} locale={locale} />
            )}
            {renderMultiDayEvents(recousedEvents)}
          </span>
        </TableGrid>

        {/* <TableGrid days={1} >
          {hours.map((h, i) => {
            return (
              <Fragment key={i}>
                <span className="rs__cell rs__header rs__time" style={{ height: CELL_HEIGHT }}>
                  {dynheader ? (
                    <TimeHeader value={format(h, hFormat, { locale })}></TimeHeader>
                  ) : (
                    <></>
                  )}
                </span>
              </Fragment>
            );
          })}
        </TableGrid> */}

        <TableGrid days={1} ref={bodyRef}>
          {/* Body */}
          {hours.map((h, i) => {
            const start = new Date(`${format(selectedDate, "yyyy/MM/dd")} ${format(h, hFormat)}`);
            const end = new Date(
              `${format(selectedDate, "yyyy/MM/dd")} ${format(addMinutes(h, step), hFormat)}`
            );
            const field = resourceFields.idField;

            return (
              <Fragment key={i}>
                {/* Time Cells */}
                <span className="rs__cell rs__header rs__time" style={{ height: CELL_HEIGHT }}>
                  {/* {dynheader ? (
                    <TimeHeader value={format(h, hFormat, { locale })}></TimeHeader>
                  ) : (
                    <></>
                  )} */}

                  {/* <Typography
                    style={{ fontSize: "0.65rem", fontWeight: "800", textAlign: "center" }}
                    variant="caption"
                  >
                    {format(h, hFormat, { locale })}
                  </Typography> */}
                </span>

                <span className={`rs__cell ${isToday(selectedDate) ? "rs__today_cell" : ""}`}>
                  {/* Events of this day - run once on the top hour column */}
                  {i === 0 && (
                    <TodayEvents
                      todayEvents={filterTodayEvents(recousedEvents, selectedDate, timeZone)}
                      today={START_TIME}
                      minuteHeight={MINUTE_HEIGHT}
                      startHour={startHour}
                      step={step}
                      direction={direction}
                    />
                  )}
                  {/* Cell */}
                  <Cell
                    start={start}
                    end={end}
                    day={selectedDate}
                    height={CELL_HEIGHT}
                    resourceKey={field}
                    resourceVal={resource ? resource[field] : null}
                    cellRenderer={cellRenderer}
                  />
                </span>
              </Fragment>
            );
          })}
        </TableGrid>
      </>
    );
  };

  return resources.length ? (
    <WithResourcesHeader
      span={2}
      renderHeaderTable={renderHeaderTable}
      renderChildren={renderTable}
    />
  ) : (
    renderTable()
  );
};

export { DayNew };

const TimeHeader = (values: any) => {
  const data = values;
  return (
    <div style={{ display: "grid", height: "100%", gridTemplateColumns: "auto auto" }}>
      <div style={{ textAlign: "center", display: "grid" }}>
        <Typography
          style={{ fontSize: "0.65rem", fontWeight: "800", textAlign: "center" }}
          variant="caption"
        >
          {data.value}
        </Typography>
      </div>
      <div
        style={{
          fontSize: "0.65rem",
          display: "grid",
          gridTemplateRows: "repeat(4,1fr)",
          height: "100%",
          alignItems: "end",
          justifyItems: "end",
        }}
      >
        <div style={{ alignSelf: "center", gridRow: "1/3", gridColumn: "1" }}>15-</div>
        <div style={{ alignSelf: "center", gridRow: "2/4", gridColumn: "1" }}>30-</div>
        <div style={{ alignSelf: "center", gridRow: "3/5", gridColumn: "1" }}>45-</div>
      </div>
    </div>
  );
};
