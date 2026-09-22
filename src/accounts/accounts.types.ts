export type ProfilePayload = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
};

export type RecoveryPayload = {
  email?: string;
};

export type ResetPasswordPayload = {
  token?: string;
  password?: string;
  passwordConfirmation?: string;
};
