import { format, formatDistanceStrict } from "date-fns";

const createFormatter = (formatStr: string) => (date: string) =>
	format(new Date(date), formatStr);

export const formatTime = createFormatter("h:mm a");
export const formatMonthDate = createFormatter("MMM d");
export const formatDay = createFormatter("E");
export const formatDateTime = createFormatter("MMMM d 'at' h:mm a");
export const formatDistance = (to: string, from: string) =>
	formatDistanceStrict(to, from);
