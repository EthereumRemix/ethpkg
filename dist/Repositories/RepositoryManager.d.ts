import { IRepository, RepositoryConfig } from './IRepository';
import { ConstructorOf } from '../util';
import { ParsedSpec } from '../SpecParser';
export default class RepositoryManager {
    private repositories;
    addRepository(name: string, repo: ConstructorOf<IRepository>): Promise<void>;
    listRepositories(): Promise<Array<string>>;
    removeRepository(name: string): Promise<boolean>;
    getRepository(config: ParsedSpec | RepositoryConfig | string): Promise<IRepository | undefined>;
}
