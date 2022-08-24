import { Command, Options } from 'clime';
export declare class KeyOptions extends Options {
    projectName?: string;
}
export default class extends Command {
    execute(outPath?: string, options?: KeyOptions): Promise<void>;
}
