import { Command, Options } from 'clime';
export declare class SignOptions extends Options {
    overwrite: boolean;
    alias?: string;
    password?: string;
    inplace?: boolean;
    createKey?: boolean;
    keystorePath?: string;
}
export default class extends Command {
    execute(inputPath: string, options: SignOptions): Promise<void>;
}
