"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GitHub_1 = __importDefault(require("./GitHub"));
const Azure_1 = __importDefault(require("./Azure"));
const Npm_1 = __importDefault(require("./Npm"));
const Bintray_1 = __importDefault(require("./Bintray"));
const Ipfs_1 = __importDefault(require("./Ipfs"));
const EthpkgRepo_1 = __importDefault(require("./EthpkgRepo"));
class RepositoryManager {
    constructor() {
        // TODO replace with handleSpec mechanism: let repos tell the manager if they can answer requests
        this.repositories = {
            'github': GitHub_1.default,
            'azure': Azure_1.default,
            'windows': Azure_1.default,
            'npm': Npm_1.default,
            'bintray': Bintray_1.default,
            'ipfs': Ipfs_1.default,
            'ethpkg': EthpkgRepo_1.default,
            'ethpkg.org': EthpkgRepo_1.default
        };
    }
    addRepository(name, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            this.repositories[name] = repo;
        });
    }
    listRepositories() {
        return __awaiter(this, void 0, void 0, function* () {
            return Object.keys(this.repositories);
        });
    }
    removeRepository(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return delete this.repositories[name];
        });
    }
    getRepository(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof config === 'string') {
                if (config in this.repositories) {
                    return new this.repositories[config]({});
                }
                return undefined;
            }
            const { name } = config;
            if (name && name in this.repositories) {
                return new this.repositories[name.toLowerCase()](config);
            }
            // nothing found: ask repos
            const repos = Object.values(this.repositories);
            for (const repo of repos) {
                if (repo.hasOwnProperty('handlesSpec')) {
                    // @ts-ignore
                    const processedConfig = repo.handlesSpec(config);
                    if (processedConfig) {
                        return new repo(processedConfig);
                    }
                }
            }
            return undefined;
        });
    }
}
exports.default = RepositoryManager;
//# sourceMappingURL=RepositoryManager.js.map