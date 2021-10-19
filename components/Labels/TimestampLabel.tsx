import { DateTime } from "luxon";
import React from "react";

export function TimestampLabel({ dt }: { dt: DateTime }) {
  return (
    <>
      {dt.toUTC().toLocaleString({
        ...DateTime.DATETIME_FULL_WITH_SECONDS,
        hour12: false,
      })}{" "}
      ({dt.toRelativeCalendar()})
    </>
  );
}
