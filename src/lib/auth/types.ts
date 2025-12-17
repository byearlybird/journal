export type User = {
	id: string;
	email: string;
	encryptedMasterKey: string;
	createdAt: string;
	updatedAt: string;
};

export type SignInCredentials = {
	email: string;
	password: string;
};

export type AuthResponse = {
	user: User;
	accessToken: string;
	refreshToken: string;
};
