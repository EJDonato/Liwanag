// Staff see dates in the clinic's own time zone, whatever the server's clock says.
const zone = "Asia/Manila";

const dateTime = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: zone });
const dateOnly = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: zone });

export const formatDateTime = (d: Date) => dateTime.format(d);
export const formatDate = (d: Date) => dateOnly.format(d);

// Birthdates are stored as UTC midnight, so format them in UTC or they can shift a day.
export const formatBirthdate = (d: Date) => new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeZone: "UTC" }).format(d);

// The current time, for use while rendering. Date.now() and new Date() are flagged by Next during
// its prerender pass; performance.timeOrigin + performance.now() is the same wall clock without that.
export const renderClock = () => new Date(Math.round(performance.timeOrigin + performance.now()));
