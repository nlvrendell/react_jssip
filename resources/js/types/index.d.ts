export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
};

export interface Contact {
    id: string;
    first_name: string;
    last_name: string;
    user: string;
    presence: string;
}

export interface CallHistoryItem {
    cdr_id: string;
    first_name: string;
    last_name: string;
    number: string;
    time_start: string;
    time_release: string;
    type: "0" | "1" | "2"; // 0 = incoming, 1 = outgoing, 2 = missed
    duration: number;
    CdrR: { orig_from_name: string; orig_sub: string; orig_req_user: string };
}
