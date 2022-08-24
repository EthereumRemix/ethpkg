import { IRepository, FetchOptions, IRelease } from "../IRepository";
export default class Mock implements IRepository {
    name: string;
    testCase: string;
    constructor(testCase: string);
    private getJson;
    listReleases(options?: FetchOptions | undefined): Promise<IRelease[]>;
}
