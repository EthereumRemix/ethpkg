import { Command, Options } from 'clime';
export declare const startSignFlow: (inputPath: string, keyFilePath?: string | undefined) => Promise<void>;
export declare class SignOptions extends Options {
    overwrite: boolean;
    publish: boolean;
}
export default class extends Command {
    execute(inputPath?: string, keyFilePath?: string, options?: SignOptions): Promise<void>;
}
