import type { AuthResponse, SignInCredentials } from "./types";

/**
 * Stubbed sign-in function that returns mock data
 * TODO: Replace with actual API call
 */
export async function signIn(
	credentials: SignInCredentials,
): Promise<AuthResponse> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Mock response - replace with actual API call
	// const response = await fetch(`${API_BASE_URL}/auth/signin`, {
	//   method: 'POST',
	//   headers: { 'Content-Type': 'application/json' },
	//   body: JSON.stringify(credentials),
	// });
	// if (!response.ok) throw new Error('Sign in failed');
	// return response.json();

	const mockUser = {
		id: "user_123",
		email: credentials.email,
		encryptedMasterKey: "encrypted_key_placeholder",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	const mockAccessToken = "mock_access_token_placeholder";
	const mockRefreshToken = "mock_refresh_token_placeholder";

	return {
		user: mockUser,
		accessToken: mockAccessToken,
		refreshToken: mockRefreshToken,
	};
}
