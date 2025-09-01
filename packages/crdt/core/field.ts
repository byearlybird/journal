import type { Eventstamp, Field, Path, Value } from "./types";

export const makeField = ({
	eventstamp,
	path,
	value,
}: {
	eventstamp: Eventstamp;
	path: Path;
	value: Value;
}): Field => {
	return [eventstamp, path, value];
};

export const eventstamp = (field: Field): Eventstamp => {
	return field[0];
};

export const path = (field: Field): Path => {
	return field[1];
};

export const value = (field: Field): Value => {
	return field[2];
};
