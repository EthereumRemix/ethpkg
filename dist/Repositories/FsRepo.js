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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FileSystemRepository {
    constructor({ project = '' }) {
        this.name = 'FileSystemRepository';
        this.dirPath = project;
    }
    toRelease(fileName) {
        const fullPath = path_1.default.join(this.dirPath, fileName);
        try {
            const data = JSON.parse(fs_1.default.readFileSync(fullPath, 'utf8'));
            const { name, version, displayVersion, channel, fileName, updated_ts, updated_at, size, original, error, location, remote } = data;
            return {
                name,
                version,
                displayVersion,
                channel,
                fileName,
                updated_ts,
                updated_at,
                size,
                original,
                error,
                location,
                remote // if package is available locally or only remote
            };
        }
        catch (error) {
            return {
                fileName,
                error: 'Could not parse metadata file'
            };
        }
    }
    /**
     * The FS Repo expects a structure:
     * my-package-1.0.0.tar.gz
     * my-package-1.0.0.tar.gz.json
     * where package and metadata are stored next to each other
     * @param options
     */
    listReleases(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = fs_1.default.readdirSync(this.dirPath);
            const releases = files.filter(f => f.endsWith('.json')).map(this.toRelease.bind(this));
            return releases;
        });
    }
}
exports.default = FileSystemRepository;
//# sourceMappingURL=FsRepo.js.map