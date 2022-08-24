import { IRepository, FetchOptions, IRelease } from './IRepository';
export default class FileSystemRepository implements IRepository {
    name: string;
    dirPath: string;
    constructor({ project }: {
        project?: string | undefined;
    });
    private toRelease;
    /**
     * The FS Repo expects a structure:
     * my-package-1.0.0.tar.gz
     * my-package-1.0.0.tar.gz.json
     * where package and metadata are stored next to each other
     * @param options
     */
    listReleases(options?: FetchOptions | undefined): Promise<Array<IRelease>>;
}
