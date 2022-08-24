import { Command, Options } from 'clime';
export declare class KeyOptions extends Options {
    alias: string;
    password?: string;
    keystorePath?: string;
}
export default class extends Command {
    execute(options: KeyOptions): Promise<void>;
}
