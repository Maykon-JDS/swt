export type Salts = [string, string];

export type VerifyBypass = 'audience' | 'expiresOn';

export type timeScale = 'seconds' | 'minutes';

export type IssueContent = {
    audience: string;
    expiresOn?: {
        scale: timeScale;
        time: number;
    };
    extras?: Record<string, any>;
};

export type ContentSWT = {
    sti: string;
    issuer: string;
    audience: string;
    expiresOn: number;
    extras?: Record<string, any>;
};

export type SWT = {
    content: ContentSWT;
    signature: string;
};
