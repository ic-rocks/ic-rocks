import { Duration } from "luxon";
import { pluralize } from "./strings";

export const formatDuration = (d: Duration) => {
  return (
    (d.years > 0 ? `${d.years} ${pluralize("year", d.years)}, ` : "") +
    (d.months > 0 ? `${d.months} ${pluralize("month", d.months)}, ` : "") +
    (d.days > 0 ? `${Math.floor(d.days)} ${pluralize("day", d.days)}` : "")
  );
};
