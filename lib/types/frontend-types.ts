// FRONTEND-TYPES
// The following definitions describe data structures that
// the frontend uses internally, as well as the shape
// expected to be returned in API endpoints
// Version: 2

import { Reading, User } from "./backend-types";

export type UserLocal = Omit<User, "hashed_password">;

export type ChatAsPost = {
    chat: Reference;
    creation_date: Date;
    creator: {
        name: string;
        last_name: string;
        degree: string;
        timezone: UtcOffset;
        profile_picture: Url;
    };
    first_comment_text: string;
    commenters: Reference[];
    followers: Reference[];
    readings: Reading[];
    prototype_name: string;
};

export type ChatAsHighlight = {
    chat: Reference;
    creator_profile_picture: string;
    start_date: Date;
    end_date: Date;
}

export type ChatAsMessage = {
    text: string;
    author: {
        full_name: string;
        degree: string;
        timezone: UtcOffset;
        profile_picture: Url;
    };
    creation_time: Timestamp;
    is_myself: boolean;
};
