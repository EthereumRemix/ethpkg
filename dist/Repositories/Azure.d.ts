import { IRepository, IRelease, FetchOptions } from './IRepository';
import { ParsedSpec } from '../SpecParser';
interface AzureBlob {
    Name: Array<string>;
    Properties: Array<{
        'Last-Modified': Array<Date>;
        'Etag': Array<string>;
        'Content-Length': Array<string>;
        'Content-Type': Array<string>;
        'Content-MD5': Array<string>;
    }>;
}
export default class AzureRepository implements IRepository {
    name: string;
    repositoryUrl: string;
    constructor({ project }: {
        [index: string]: string;
    });
    toRelease(releaseInfo: AzureBlob): IRelease;
    listReleases(options?: FetchOptions): Promise<IRelease[]>;
    static handlesSpec(spec: ParsedSpec): ParsedSpec | undefined;
}
export {};
