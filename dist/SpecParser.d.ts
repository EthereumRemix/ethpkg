import { RepositoryConfig } from './Repositories/IRepository';
export interface ParsedSpec extends RepositoryConfig {
    version?: string;
    input: string;
}
export default class Parser {
    /**
     * TODO add more unit testing for parser
     * example: npm:@philipplgh/ethpkg@^1.2.3
     * => <repo>:<owner>/<project>@<version>
     * @param spec
     */
    static parseSpec(spec: string): Promise<ParsedSpec>;
}
