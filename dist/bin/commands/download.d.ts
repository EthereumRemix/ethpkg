import { Command } from 'clime';
export default class extends Command {
    execute(spec: string, destPath: string): Promise<void>;
}
