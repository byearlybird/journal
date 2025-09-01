export type Chain<T> = {
	pipe<U>(fn: (value: T) => U): Chain<U>;
	get(): T;
	tap(fn: (value: T) => void): Chain<T>;
};

export const chain = <T = undefined>(value: T = undefined as T): Chain<T> => ({
	get: () => value,
	pipe: <U>(fn: (value: T) => U): Chain<U> => chain(fn(value)),
	tap: (fn: (value: T) => void) => {
		fn(value);
		return chain(value);
	},
});
