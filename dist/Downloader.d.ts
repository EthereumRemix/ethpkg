/// <reference types="node" />
import http from 'http';
export declare function request(method: string, _url: string, opts?: any): Promise<http.IncomingMessage>;
export declare function fetch(method: string, _url: string, opts?: any): Promise<Buffer>;
export declare function downloadStreamToBuffer(response: http.IncomingMessage, progress?: (p: number) => void): Promise<Buffer>;
export declare function download(_url: string, onProgress?: (progress: number) => void, redirectCount?: number, options?: {
    parallel: number;
    headers: undefined;
}): Promise<Buffer>;
export declare function downloadJson(_url: string): Promise<any>;
