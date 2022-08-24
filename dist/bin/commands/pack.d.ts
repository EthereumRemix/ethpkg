import { Command } from 'clime';
export default class extends Command {
    execute(dirPath?: string): Promise<void>;
}
