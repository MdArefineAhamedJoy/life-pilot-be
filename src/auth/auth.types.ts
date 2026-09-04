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
  token: string;
  expiresAt: string;
};
