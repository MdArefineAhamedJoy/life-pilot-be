export type RegisterPayload = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  imageUrl?: string;
};

export type LoginPayload = {
  email?: string;
  password?: string;
  rememberMe?: boolean;
};

export type AuthUserResponse = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  imageUrl?: string;
};

export type AuthResponse = {
  user: AuthUserResponse;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
};
