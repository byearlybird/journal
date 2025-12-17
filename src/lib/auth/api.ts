import type { AppRoutes } from "@byearlybird/cloud";
import type {
	AuthResponse,
	SignInCredentials,
	SignUpCredentials,
} from "./types";
import { hc } from "hono/client";

const client = hc<AppRoutes>("http://localhost:3000");

export async function signIn(
	credentials: SignInCredentials,
): Promise<AuthResponse> {
	const response = await client.auth.signin.$post({
		json: credentials,
	});

	if (!response.ok) {
		throw new Error("Sign in failed");
	}

	return (await response.json()) as AuthResponse;
}

export async function signUp(
	credentials: SignUpCredentials,
): Promise<AuthResponse> {
	const response = await client.auth.signup.$post({
		json: credentials,
	});

	if (!response.ok) {
		throw new Error("Sign up failed");
	}

	return (await response.json()) as AuthResponse;
}
