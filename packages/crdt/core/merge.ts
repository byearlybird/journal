import * as S from "./field";
import type { Field, State } from "./types";

const findField = (state: State, next: Field) =>
	state.find((f) => S.path(f) === S.path(next));

const replaceField = (state: State, next: Field) => {
	const removed = state.filter((existing) => S.path(existing) !== S.path(next));
	return [...removed, next];
};

export const mergeField = (state: State, next: Field): [State, boolean] => {
	// find matching path
	const current = findField(state, next);
	if (!current) {
		return [[...state, next], true];
	} else if (S.eventstamp(current) > S.eventstamp(next)) {
		return [state, false];
	} else {
		return [replaceField(state, next), true];
	}
};

export const mergeState = (state: State, next: State): [State, boolean] => {
	const [newState, modified] = next.reduce(
		([acc, mod], field) => {
			const [mergedState, changed] = mergeField(acc, field);
			return [mergedState, mod || changed];
		},
		[state, false],
	);
	return [newState, modified];
};
