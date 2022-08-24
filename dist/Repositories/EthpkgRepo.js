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
Object.defineProperty(exports, "__esModule", { value: true });
const PackageUtils_1 = require("../utils/PackageUtils");
const sdk_1 = require("@ianu/sdk");
const ens_1 = require("../ENS/ens");
class EthpkgRepository {
    constructor({ owner = '', project = '' }) {
        this.name = 'EthpkgRepository';
        const [spaceId, subSpace] = owner.split('-');
        this.registryId = `${spaceId}/${subSpace}`;
        const [userId, projectId] = project.split('/');
        /*
        if (!userId || !projectId) {
          throw new Error(`Malformed project identifier: "${project}"`)
        }
        */
        this.project = project;
        this.toRelease = this.toRelease.bind(this);
    }
    toRelease(release) {
        // console.log('release', release)
        const pkgInfo = release.assets && release.assets.length > 0 ? release.assets[0] : { fileName: '<error>', location: undefined };
        let { fileName, location } = pkgInfo;
        if (location) {
            // convert file location in downloadable url
            location = sdk_1.Storage.getDownloadLinkForKey(location);
        }
        const updated_ts = release.updated_at || Date.now();
        return {
            name: release.name,
            version: release.version,
            displayVersion: release.version,
            channel: undefined,
            fileName,
            updated_ts,
            updated_at: PackageUtils_1.datestring(updated_ts),
            location,
            original: release
        };
    }
    login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            // check existing session
            if (!credentials.privateKey) {
                throw new Error('Invalid credentials - login with private key');
            }
            const { session, address } = yield sdk_1.Auth.signIn(credentials.privateKey);
            this.session = session;
            this.address = address;
            return session;
        });
    }
    isLoggedIn() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.session && (yield sdk_1.Auth.hasValidSession(this.session));
        });
    }
    listReleases(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isLoggedIn) {
                // TODO handle public and private repos
            }
            // TODO allow public key for search
            const registry = new sdk_1.Registry(this.registryId);
            let parts = this.project.split('/');
            let userId = parts.shift();
            if (!userId) {
                throw new Error('Malformed project ID');
            }
            if (userId.endsWith('.eth')) {
                let nameResolved = yield ens_1.resolveName(userId);
                if (!nameResolved) {
                    throw new Error(`ENS name ${userId} could not be resolved`);
                }
                userId = nameResolved;
            }
            let project = [userId, ...parts].join('/');
            const releases = yield registry.listReleases(project);
            return releases.map((release) => this.toRelease(release));
        });
    }
    publish(pkg, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isLoggedIn())) {
                throw new Error('Illegal operation. Only authenticated users can publish');
            }
            const pkgJsonBuf = yield pkg.getContent('package.json');
            const pkgJson = JSON.parse(pkgJsonBuf.toString());
            const requiredFields = ['name', 'version', 'description', 'author'];
            for (const fieldName of requiredFields) {
                if (!pkgJson[fieldName]) {
                    throw new Error(`Required field "${fieldName}" is missing from package.json`);
                }
            }
            const { name, version, description, author } = pkgJson;
            const metadata = {
                name,
                displayName: name,
                version: version,
                icon: undefined,
                description: description,
                shortDescription: description,
                publisher: {
                    name: author.name,
                    displayName: author.name,
                    // TODO email: author.email,
                    address: this.address
                }
            };
            const registry = new sdk_1.Registry(this.registryId, this.session);
            const buf = yield pkg.toBuffer();
            const result = yield registry.createRelease(metadata, [{ fileName: pkg.fileName, buffer: buf }]);
            return this.toRelease(result);
        });
    }
    static handlesSpec(spec) {
        return spec.name && spec.name.toLowerCase() === 'ethpkg' ? spec : undefined;
    }
}
exports.default = EthpkgRepository;
//# sourceMappingURL=EthpkgRepo.js.map