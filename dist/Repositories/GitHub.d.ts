import { IRepository, IRelease, FetchOptions, PublishOptions } from './IRepository';
import { IPackage } from '../PackageManager/IPackage';
export default class GitHubRepository implements IRepository {
    name: string;
    private client;
    private owner;
    private repo;
    constructor({ owner, project, auth }: {
        owner?: string | undefined;
        project?: string | undefined;
        auth?: undefined;
    });
    private _toRelease;
    private toRelease;
    listReleases(options?: FetchOptions): Promise<IRelease[]>;
    publish(pkg: IPackage, options?: PublishOptions): Promise<IRelease>;
}
