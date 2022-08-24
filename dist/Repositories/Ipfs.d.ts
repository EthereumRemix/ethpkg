import { IRepository, IRelease, FetchOptions, PublishOptions } from './IRepository';
import { IPackage } from '../PackageManager/IPackage';
/**
 * https://github.com/ipfs/go-ipfs/issues/6523
 */
export default class IpfsRepository implements IRepository {
    name: string;
    private owner;
    private repo;
    constructor({ owner, project }?: {
        owner?: string | undefined;
        project?: string | undefined;
    });
    get api(): string;
    private toRelease;
    listReleases(options?: FetchOptions): Promise<IRelease[]>;
    publish(pkg: IPackage, {}?: PublishOptions): Promise<IRelease>;
}
