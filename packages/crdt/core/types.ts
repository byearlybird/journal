/**
 * A Field, in this context, is a represenation of specific object path at a point in time.
 * State, in this context, is an array of Fields that describe a single object.
 */
type JSONArray = JSONValue[];
type JSONObject = {
	[key: string]: JSONValue;
};
export type JSONValue =
	| string
	| number
	| boolean
	| null
	| JSONObject
	| JSONArray;
export type Eventstamp = string;
export type Path = string;
export type Value = JSONValue;
export type Field = [Eventstamp, Path, Value];
export type State = Field[];
export type ClockProvider = {
	tick: () => string;
};
