import * as core from "../core";
import type { ClockProvider, JSONValue, State } from "../core/types";

type Materializer<T> = () => T | null;
type StateAccessor = () => State;
type Mutator<T> = (data: Partial<T>) => boolean;
type EventListener = () => void;

export type Store<T> = {
	get: Materializer<T>;
	set: Mutator<T>;
	getState: StateAccessor;
	setState: (next: State) => boolean;
	on: (event: "mutate", listener: EventListener) => () => void;
};

export const createStore = <T extends JSONValue>({
	defaultState = [],
	clockProvider,
}: {
	defaultState?: State;
	clockProvider: ClockProvider;
}): Store<T> => {
	let state = defaultState;
	const listeners = new Set<EventListener>();

	const maybeMutate = (next: State) => {
		const [merged, changed] = core.mergeState(state, next);
		if (changed) {
			state = merged;
			for (const listener of listeners) {
				listener();
			}
		}
		return changed;
	};

	return {
		get: () => core.objectFromState<T>(state),
		set: (data: Partial<T>) => {
			const next = core.objectToState(data, clockProvider);
			return maybeMutate(next);
		},
		getState: () => state,
		setState: (next: State) => {
			return maybeMutate(next);
		},
		on: (event: "mutate", listener: EventListener) => {
			if (event === "mutate") {
				listeners.add(listener);
			}

			return () => {
				listeners.delete(listener);
			};
		},
	};
};
