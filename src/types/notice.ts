export interface Notice {
    id: number;
    title?: string;
    content?: string;
    author?: string;
    created_at: string;
    updated_at?: string;
    is_important: boolean;
    tags?: string[];
}