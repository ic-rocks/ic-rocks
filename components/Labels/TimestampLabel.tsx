import { DateTime, Duration } from "luxon";
import React from "react";

let duration = (d:Duration) =>{
  console.log(d.years)
}
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
