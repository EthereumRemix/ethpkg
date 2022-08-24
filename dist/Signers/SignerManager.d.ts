import { ConstructorOf } from '../util';
import ISigner from '../PackageSigner/ISigner';
export default class SignerManager {
    private signers;
    private signerInstances;
    addSigner(name: string, signer: ConstructorOf<ISigner> | ISigner): Promise<void>;
    getSigner(name: string): Promise<ISigner | undefined>;
    listSigners(): Promise<Array<string>>;
    removeSigner(name: string): Promise<boolean>;
}
