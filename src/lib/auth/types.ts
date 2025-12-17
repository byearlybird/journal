import type { AppRoutes } from "@byearlybird/cloud";
import { hc } from "hono/client";

const client = hc<AppRoutes>("http://localhost:3000");

// Infer request types from Hono client
export type SignInCredentials = Parameters<
	typeof client.auth.signin.$post
>[0]["json"];
export type SignUpCredentials = Parameters<
	typeof client.auth.signup.$post
>[0]["json"];

// Explicit response types (Hono client inference not working correctly)
export type User = {
	id: string;
	email: string;
	encryptedMasterKey: string;
	createdAt: string;
	updatedAt: string;
};

export type AuthResponse = {
	user: User;
	accessToken: string;
	refreshToken: string;
};
