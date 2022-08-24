import { IRepository, FetchOptions, IRelease } from './IRepository';
export default class NpmRepository implements IRepository {
    name: string;
    owner: string;
    project: string;
    constructor({ owner, project }: {
        [index: string]: string;
    });
    private toRelease;
    listReleases(options?: FetchOptions | undefined): Promise<IRelease[]>;
}
