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
const util_1 = require("./util");
const url_1 = __importDefault(require("url"));
const parseUrl = (urlStr) => {
    const parsedUrl = url_1.default.parse(urlStr);
    const { pathname, host } = parsedUrl;
    // @ts-ignore
    const hostParts = host.split('.');
    hostParts.pop(); // remove top-level domain
    let project = undefined;
    let owner = undefined;
    if (pathname && pathname != '/') {
        let pathParts = pathname.split('/');
        pathParts = pathParts.filter(p => p && p !== '');
        owner = pathParts[0];
        project = pathParts[1];
    }
    else {
        project = hostParts[0];
    }
    const result = {
        name: hostParts.pop(),
        owner,
        project,
        version: undefined,
        input: urlStr
    };
    return result;
};
class Parser {
    /**
     * TODO add more unit testing for parser
     * example: npm:@philipplgh/ethpkg@^1.2.3
     * => <repo>:<owner>/<project>@<version>
     * @param spec
     */
    static parseSpec(spec) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!spec)
                throw new Error('spec cannot be parsed - spec is undefined');
            if (util_1.isUrl(spec)) {
                try {
                    return parseUrl(spec);
                }
                catch (error) {
                    throw new Error(`SpecParser error for "${spec}": ${error.message}`);
                }
            }
            const getRepo = (spec) => {
                const parts = spec.split(':');
                return parts.length > 1 ? parts[0] : undefined;
            };
            const repo = getRepo(spec);
            if (!repo) {
                throw new Error('Malformed query');
            }
            spec = spec.slice(repo.length + 1);
            const getVersion = (project) => {
                const project_parts = project.split('@');
                let version = project_parts.length > 1 ? project_parts[1] : undefined;
                if (project_parts.length > 1) {
                    project = project.substring(0, project.indexOf('@'));
                }
                if (version === 'latest') {
                    version = undefined;
                }
                return {
                    version,
                    project
                };
            };
            const parts = spec.split('/');
            if (parts.length > 1) {
                const owner = parts.shift();
                const project = parts.join('/');
                const { version, project: projectParsed } = getVersion(project);
                return {
                    input: spec,
                    name: repo,
                    owner,
                    project: projectParsed,
                    version
                };
            }
            else if (parts.length === 1) {
                const project = parts[0];
                const { version, project: projectParsed } = getVersion(project);
                return {
                    input: spec,
                    name: repo,
                    owner: undefined,
                    project: projectParsed,
                    version: version
                };
            }
            throw new Error(`SpecParser error: no parser found for "${spec}"`);
        });
    }
}
exports.default = Parser;
//# sourceMappingURL=SpecParser.js.map