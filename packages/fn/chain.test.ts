import { describe, expect, it, mock } from "bun:test";
import { chain } from "./chain";

describe("Chain utilities", () => {
	describe("chain constructor", () => {
		it("creates Chain object with initial value", () => {
			const result = chain(42);
			expect(result.get()).toBe(42);
		});
	});

	describe("pipe method", () => {
		it("transforms value and returns new Chain", () => {
			const result = chain(5)
				.pipe((x) => x * 2)
				.pipe((x) => x + 1);

			expect(result.get()).toBe(11);
		});

		it("works with different types", () => {
			const result = chain(42)
				.pipe((x) => x.toString())
				.pipe((s) => s.length);

			expect(result.get()).toBe(2);
		});
	});

	describe("get method", () => {
		it("returns wrapped value", () => {
			const result = chain("hello").get();
			expect(result).toBe("hello");
		});
	});

	describe("tap method", () => {
		it("executes function and returns same Chain", () => {
			const sideEffect = mock(() => {});
			const result = chain(42).tap(sideEffect).get();

			expect(sideEffect).toHaveBeenCalledWith(42);
			expect(result).toBe(42);
		});

		it("can be chained with other methods", () => {
			const sideEffect = mock(() => {});
			const result = chain(5)
				.tap(sideEffect)
				.pipe((x) => x * 2)
				.get();

			expect(sideEffect).toHaveBeenCalledWith(5);
			expect(result).toBe(10);
		});
	});

	describe("edge cases", () => {
		it("handles null and undefined values", () => {
			const nullChain = chain(null);
			const undefinedChain = chain(undefined);

			expect(nullChain.get()).toBe(null);
			expect(undefinedChain.get()).toBe(undefined);
		});

		it("handles identity operations", () => {
			const result = chain(42)
				.pipe((x) => x)
				.get();
			expect(result).toBe(42);
		});

		it("handles long chains", () => {
			const result = chain(1)
				.pipe((x) => x + 1)
				.pipe((x) => x * 2)
				.pipe((x) => x - 1)
				.pipe((x) => x / 3)
				.pipe((x) => x + 10)
				.get();

			expect(result).toBe(11);
		});

		it("handles exceptions in pipe functions", () => {
			const throwingChain = chain(42);
			expect(() => {
				throwingChain.pipe(() => {
					throw new Error("Test error");
				});
			}).toThrow("Test error");
		});
	});
});
