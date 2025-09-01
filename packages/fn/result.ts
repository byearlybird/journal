export type Result<OkType, ErrType> = Ok<OkType> | Err<ErrType>;

export type Ok<TData = void> = {
	readonly ok: true;
	readonly data: TData;
};

export type Err<TError = void> = {
	readonly ok: false;
	readonly error: TError;
};

// Result constructors
export function ok(): Ok<void>;
export function ok<TData>(data: TData): Ok<TData>;
export function ok<TData>(data?: TData): Ok<TData> {
	return {
		data: data as TData,
		ok: true,
	};
}

export function err(): Err<void>;
export function err<TError>(error: TError): Err<TError>;
export function err<TError>(error?: TError): Err<TError> {
	return {
		error: error as TError,
		ok: false,
	};
}

export function when<OkType, ErrType, OkR, ErrR>(
	result: Result<OkType, ErrType>,
	handlers: {
		ok: (data: OkType) => Result<OkR, ErrR>;
		err: (error: ErrType) => Result<OkR, ErrR>;
	},
): Result<OkR, ErrR> {
	if (result.ok) {
		return handlers.ok(result.data);
	}
	return handlers.err(result.error);
}
