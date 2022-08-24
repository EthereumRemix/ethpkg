export interface SerializationInfo {
    data: any;
    ctor: string;
    ts: number;
}
export interface ISerializable {
    getObjectData(): Promise<any>;
}
export declare function isSerializable(obj: any): obj is ISerializable;
