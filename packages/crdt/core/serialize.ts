import * as flat from "flat";
import * as S from "./field";
import type { ClockProvider, JSONValue, State } from "./types";

export const objectToState = <T extends JSONValue>(
	object: Partial<T>,
	clockProvider: ClockProvider,
): State => {
	const flattened: { [key: string]: JSONValue } = flat.flatten(object);
	return Object.entries(flattened).map(([path, value]) =>
		S.makeField({
			path,
			value,
			eventstamp: clockProvider.tick(),
		}),
	);
};

export const objectFromState = <T extends JSONValue>(
	state: State,
): T | null => {
	if (state.length === 0) {
		return null;
	}
	const flattened = state.reduce(
		(acc, field) => {
			acc[S.path(field)] = S.value(field);
			return acc;
		},
		{} as Record<string, JSONValue>,
	);
	return flat.unflatten(flattened) as T;
};
