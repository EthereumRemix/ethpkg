import { Command } from 'clime';
export default class extends Command {
    execute(pkgPath: string, address?: string): Promise<void>;
}
