import { IRepository, IRelease, FetchOptions } from "./IRepository";
export default class BintrayRepository implements IRepository {
    name: string;
    owner: string;
    repo: string;
    package: any;
    constructor({ owner, project }: {
        [index: string]: string;
    });
    toRelease(pkgInfo: any): IRelease;
    listReleases(options?: FetchOptions | undefined): Promise<IRelease[]>;
}
