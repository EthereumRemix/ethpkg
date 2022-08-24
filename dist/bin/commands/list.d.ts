import { Command, Options } from 'clime';
export declare class ListOptions extends Options {
    attributes: string;
}
export default class extends Command {
    execute(spec: string, options: ListOptions): Promise<void>;
}
