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
    name: string;
    number: string;
    avatar: string;
}

export interface CallHistoryItem {
    id: string;
    name: string;
    number: string;
    timestamp: Date;
    type: "incoming" | "outgoing" | "missed";
    duration: number;
}
