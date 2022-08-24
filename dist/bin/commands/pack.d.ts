import { Command } from 'clime';
export default class extends Command {
    execute(inputDirPath: string, packageName?: string): Promise<void>;
}
