import { User } from "./types";

export type UserLocal = Omit<User, "hashed_password">;
