import { Command, Options } from 'clime';
export declare class PublishOptions extends Options {
    sign?: boolean;
    key?: string;
    login?: false;
    repository?: '';
}
export default class extends Command {
    execute(packagePath: string, repository: string, options: PublishOptions): Promise<void>;
}
