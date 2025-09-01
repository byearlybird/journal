import { describe, expect, it } from "bun:test";
import { err, ok } from "./result";

describe("Result utilities", () => {
	describe("ok", () => {
		it("creates Ok object with correct ok field and data", () => {
			const result = ok("test data");
			expect(result).toEqual({
				data: "test data",
				ok: true,
			});
		});

		it("works with different data types", () => {
			const numberResult = ok(42);
			const objectResult = ok({
				key: "value",
			});

			expect(numberResult.ok).toBe(true);
			expect(numberResult.data).toBe(42);
			expect(objectResult.ok).toBe(true);
			expect(objectResult.data).toEqual({
				key: "value",
			});
		});
	});

	describe("err", () => {
		it("creates Err object with correct ok field and error", () => {
			const result = err("error message");
			expect(result).toEqual({
				error: "error message",
				ok: false,
			});
		});

		it("works with different error types", () => {
			const stringError = err("string error");
			const objectError = err({
				code: 500,
				message: "Server error",
			});

			expect(stringError.ok).toBe(false);
			expect(stringError.error).toBe("string error");
			expect(objectError.ok).toBe(false);
			expect(objectError.error).toEqual({
				code: 500,
				message: "Server error",
			});
		});
	});

	describe("type discrimination", () => {
		it("can discriminate between ok and err using ok boolean", () => {
			const okResult = ok("success");
			const errResult = err("failure");

			if (okResult.ok) {
				expect(okResult.data).toBe("success");
			}

			if (!errResult.ok) {
				expect(errResult.error).toBe("failure");
			}
		});
	});

	describe("edge cases", () => {
		it("handles null and undefined values in ok", () => {
			const nullResult = ok(null);
			const undefinedResult = ok(undefined);

			expect(nullResult.ok).toBe(true);
			expect(nullResult.data).toBe(null);
			expect(undefinedResult.ok).toBe(true);
			expect(undefinedResult.data).toBe(undefined);
		});

		it("handles null and undefined values in err", () => {
			const nullResult = err(null);
			const undefinedResult = err(undefined);

			expect(nullResult.ok).toBe(false);
			expect(nullResult.error).toBe(null);
			expect(undefinedResult.ok).toBe(false);
			expect(undefinedResult.error).toBe(undefined);
		});

		it("handles empty values", () => {
			const emptyString = ok("");
			const emptyArray = ok([]);
			const emptyObject = ok({});

			expect(emptyString.data).toBe("");
			expect(emptyArray.data).toEqual([]);
			expect(emptyObject.data).toEqual({});
		});
	});
});
