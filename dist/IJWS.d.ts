export interface IFlattenedJwsSerialization {
    header?: any;
    protected?: string;
    payload: string | any;
    signature: string;
}
