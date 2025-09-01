export type Option<T> = Some<T> | None;

export type Some<T> = {
	readonly tag: "some";
	readonly value: T;
};

export type None = {
	readonly tag: "none";
};

// Option constructors
export const some = <T>(value: T): Some<T> => ({
	tag: "some",
	value,
});

export const none = (): None => ({
	tag: "none",
});
