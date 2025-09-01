declare global {
	type JSONArray = JSONValue[];
	type JSONObject = {
		[key: string]: JSONValue;
	};
	type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
}

export {};
