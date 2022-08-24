import { Command } from 'clime';
export default class extends Command {
    execute(pkgQuery: string, address?: string): Promise<void>;
}
