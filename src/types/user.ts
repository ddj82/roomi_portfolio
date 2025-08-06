export interface User {
    name: string;
    email: string;
    password: string;
    channel?: string;
    nationality?: string;
    sex?: string;
    birth: string;
    phone?: string;
    channel_uid?: string;
    profile_image?: string;
    accept_SMS? : boolean;
    accept_alert? : boolean;
    accept_email? : boolean;
    bank_holder?: string;
    bank?: string;
    account?: string;
    is_korean?: boolean;
    identity_verified?: boolean;
}