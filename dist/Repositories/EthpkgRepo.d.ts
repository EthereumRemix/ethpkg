import { IRepository, IRelease, FetchOptions, Credentials } from './IRepository';
import { IPackage } from '../PackageManager/IPackage';
import { ParsedSpec } from '../SpecParser';
export default class EthpkgRepository implements IRepository {
    name: string;
    private session;
    address: any;
    private registryId;
    private project;
    constructor({ owner, project }: {
        owner?: string | undefined;
        project?: string | undefined;
    });
    private toRelease;
    login(credentials: Credentials): Promise<boolean>;
    isLoggedIn(): Promise<boolean>;
    listReleases(options?: FetchOptions): Promise<IRelease[]>;
    publish(pkg: IPackage, options?: any): Promise<IRelease>;
    static handlesSpec(spec: ParsedSpec): ParsedSpec | undefined;
}
