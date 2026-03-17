import { Reading, User } from "./types";

type Reference = string;
type UtcOffset = string;

export type UserLocal = Omit<User, "hashed_password">;

export type ChatAsPost = {
    chat: Reference;
    creation_date: Date;
    creator: {
        name: string;
        last_name: string;
        degree: string;
        timezone: UtcOffset;
        profile_picture: string;
    };
    first_comment_text: string;
    commenters: Reference[];
    followers: Reference[];
    readings: Reading[];
    prototype_name: string;
};
