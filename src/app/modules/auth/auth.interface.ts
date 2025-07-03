export type TLoginUser = {
  email: string;
  password: string;
};

export type TRegisterUser = {
  name: string;
  email: string;
  role: "admin" | "user"; // Assuming roles are either admin or user
  password: string;
  confirmPassword: string;
  avatar?: string;
};

export type TOAuthUser = {
  googleId?: string;
  facebookId?: string;
  name: string;
  email: string;
  avatar?: string;
};
