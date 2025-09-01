import type { ClockProvider } from "../core/types";

export const createSystemClock = (): ClockProvider => {
	return {
		tick: () => {
			return new Date().toISOString();
		},
	};
};
