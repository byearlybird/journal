import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { signIn as apiSignIn } from "./api";
import {
	decryptMasterKey,
	deleteCryptoKey,
	getCryptoKey,
	storeCryptoKey,
} from "./crypto-key";
import type { SignInCredentials, User } from "./types";

const AUTH_ACCESS_TOKEN_KEY = "journal_auth_access_token";
const AUTH_REFRESH_TOKEN_KEY = "journal_auth_refresh_token";
const AUTH_USER_KEY = "journal_auth_user";

type AuthState = {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
	signIn: (credentials: SignInCredentials) => Promise<void>;
	signOut: () => Promise<void>;
	isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AuthState>({
		user: null,
		accessToken: null,
		refreshToken: null,
		isAuthenticated: false,
	});
	const [isLoading, setIsLoading] = useState(true);

	// Restore session from localStorage on mount
	useEffect(() => {
		const restoreSession = async () => {
			try {
				const storedAccessToken = localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
				const storedRefreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
				const storedUserJson = localStorage.getItem(AUTH_USER_KEY);

				if (storedAccessToken && storedRefreshToken && storedUserJson) {
					const storedUser = JSON.parse(storedUserJson) as User;
					// Try to restore crypto key from IndexedDB
					const cryptoKey = await getCryptoKey();

					if (cryptoKey) {
						setState({
							user: storedUser,
							accessToken: storedAccessToken,
							refreshToken: storedRefreshToken,
							isAuthenticated: true,
						});
					} else {
						// Crypto key missing, clear session
						localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
						localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
						localStorage.removeItem(AUTH_USER_KEY);
					}
				}
			} catch (error) {
				console.error("Failed to restore session:", error);
				// Clear potentially corrupted data
				localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
				localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
				localStorage.removeItem(AUTH_USER_KEY);
			} finally {
				setIsLoading(false);
			}
		};

		restoreSession();
	}, []);

	const handleSignIn = async (credentials: SignInCredentials) => {
		try {
			// Call API (stubbed for now)
			const response = await apiSignIn(credentials);

			// Decrypt the master key
			const decryptedKey = await decryptMasterKey(
				response.user.encryptedMasterKey,
				credentials.password,
			);

			// Store in localStorage
			localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, response.accessToken);
			localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, response.refreshToken);
			localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));

			// Store crypto key in IndexedDB
			await storeCryptoKey(decryptedKey);

			// Update state
			setState({
				user: response.user,
				accessToken: response.accessToken,
				refreshToken: response.refreshToken,
				isAuthenticated: true,
			});
		} catch (error) {
			console.error("Sign in failed:", error);
			throw error;
		}
	};

	const handleSignOut = async () => {
		try {
			// Clear localStorage
			localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
			localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
			localStorage.removeItem(AUTH_USER_KEY);

			// Clear crypto key from IndexedDB
			await deleteCryptoKey();

			// Update state
			setState({
				user: null,
				accessToken: null,
				refreshToken: null,
				isAuthenticated: false,
			});
		} catch (error) {
			console.error("Sign out failed:", error);
			throw error;
		}
	};

	const value: AuthContextValue = {
		...state,
		signIn: handleSignIn,
		signOut: handleSignOut,
		isLoading,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
