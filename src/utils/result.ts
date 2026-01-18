export type Result<OkType, ErrType> =
  | { readonly ok: true; readonly data: OkType }
  | { readonly ok: false; readonly error: ErrType };

// Result constructors
export const ok = <TData>(data: TData): { ok: true; data: TData } => ({
  ok: true,
  data,
});

export const err = <TError>(error: TError): { ok: false; error: TError } => ({
  ok: false,
  error,
});
