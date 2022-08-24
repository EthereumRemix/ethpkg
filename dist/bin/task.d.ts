import ora from 'ora';
export declare const startTask: (name: string) => {
    taskName: string;
    updateText: (text: string) => string;
    succeed: (text?: string | undefined) => ora.Ora;
};
export interface FormatOptions {
    taskName: string;
    timeMs: number;
}
export declare type FormatCallback = (info: FormatOptions) => string;
export declare const startNewTask: (name: string) => {
    taskName: string;
    updateText: (text: string) => string;
    succeed: (text?: string | FormatCallback | undefined) => void;
    fail: (text?: string | undefined) => void;
    time: () => number;
};
export declare const succeed: (msg?: string | undefined) => void;
export declare const progress: (msg: string) => void;
export declare const failed: (msg: string, msgText?: string | undefined) => never;
