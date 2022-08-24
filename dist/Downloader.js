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
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const url_1 = __importDefault(require("url"));
const zlib_1 = __importDefault(require("zlib"));
const stream_1 = __importDefault(require("stream"));
const form_data_1 = __importDefault(require("form-data"));
class WritableMemoryStream extends stream_1.default.Writable {
    constructor() {
        super();
        this.data = [];
        this.buffer = undefined;
        this.data = [];
        this.once('finish', () => {
            // it seems that if data ony contains one item concat takes significantly longer
            // which uncovered a race condition of stream events
            this.buffer = this.data.length === 1 ? this.data.pop() : Buffer.concat(this.data);
        });
    }
    // for 30 MB file this takes .3 sec
    _write(chunk, enc, cb) {
        this.data.push(chunk);
        cb();
    }
}
function request(method, _url, opts = {}) {
    const parsedURL = url_1.default.parse(_url);
    const { protocol, hostname, port, path } = parsedURL;
    let protocolHandler = protocol === 'https:' ? https_1.default : http_1.default;
    let stream = undefined;
    if (opts['Content-Type'] && opts['Content-Type'] === 'multipart/form-data') {
        let form = new form_data_1.default();
        // FIXME filename in multipart form
        // https://github.com/form-data/form-data#alternative-submission-methods
        form.append('data', opts.Body, { filename: opts.fileName });
        opts = {
            headers: form.getHeaders()
        };
        stream = form;
    }
    else if (opts.headers && opts.headers['Content-Type'] && opts.headers['Content-Type'] === 'application/json') {
        if (typeof opts.Body !== 'string') {
            opts.Body = JSON.stringify(opts.Body);
        }
    }
    const { Body } = opts;
    delete opts.Body;
    const options = Object.assign({ method,
        protocol,
        hostname,
        port,
        path }, opts);
    return new Promise((resolve, reject) => {
        let req = protocolHandler.request(options, res => {
            resolve(res);
        });
        if (Body) {
            req.write(Body);
        }
        else if (stream) {
            stream.pipe(req);
        }
        req.on('error', e => {
            reject(e);
        });
        req.end();
    });
}
exports.request = request;
function fetch(method, _url, opts = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataStream = yield request(method, _url, opts);
        let buf = yield downloadStreamToBuffer(dataStream);
        // TODO move logic to reqeust
        if (dataStream.headers['content-encoding'] == 'gzip') {
            buf = zlib_1.default.gunzipSync(buf);
        }
        return buf;
    });
}
exports.fetch = fetch;
function downloadStreamToBuffer(response, progress = (p) => { }) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let headers = response.headers;
            const total = parseInt(headers['content-length'] || '0', 0);
            let completed = 0;
            let writable = new WritableMemoryStream();
            response.pipe(writable);
            response.on('data', (data) => {
                completed += data.length;
                progress(completed / total);
            });
            //response.on('progress', progress);
            response.on('error', reject);
            // race-condition: response.on('end', () => resolve(writable.buffer))
            writable.on('finish', () => resolve(writable.buffer));
        });
    });
}
exports.downloadStreamToBuffer = downloadStreamToBuffer;
const downloadPartial = (_url, start, end) => __awaiter(void 0, void 0, void 0, function* () {
    const headers = {
        'RANGE': `bytes=${start}-${end}`
    };
    const response = yield request('GET', _url, { headers });
    // console.log('response headers partial', response.headers)
    const buf = yield downloadStreamToBuffer(response, undefined);
    return buf;
});
function download(_url, onProgress = (progress) => { }, redirectCount = 0, options = { parallel: 0, headers: undefined }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (redirectCount > 5) {
            throw new Error('too many redirects: ' + redirectCount);
        }
        // test for and follow redirect (GitHub)
        const result = yield request('HEAD', _url);
        let headers = result.headers;
        // console.log('headers of HEAD', _url, result.statusCode, headers)
        /**
        server: 'nginx',
        date: 'Fri, 30 Aug 2019 07:45:23 GMT',
        'content-type': 'application/gzip',
        'content-length': '35104796',
        connection: 'close',
        'last-modified': 'Wed, 03 Jul 2019 23:41:55 GMT',
        'accept-ranges': 'none',
        etag:'484a288bee3fb161004054b1ef15072f1c7e4c0606e8cbe42705cb8be5fdcf0c',
        'x-checksum-sha1': '4405fe28b7740956fb98f3a7e9d28f6e9451d083',
        'x-checksum-sha2': '484a288bee3fb161004054b1ef15072f1c7e4c0606e8cbe42705cb8be5fdcf0c'
        */
        // TODO use headers to validate checksum or cache based on etag
        if (headers && headers['x-checksum-sha1']) {
            // can be csv
        }
        if ((result.statusCode === 302 || result.statusCode === 301) && headers.location) {
            _url = headers.location;
            return download(_url, onProgress, redirectCount++, options);
        }
        // EXPERIMENTAL use parallel connections if range requests are supported
        // TODO if content length large
        if (options && options.parallel) {
            if (headers['accept-ranges'] === 'bytes' && !headers.location) {
                const contentLength = parseInt(headers['content-length'] || '0') || 0;
                const PARALLEL_JOBS = options.parallel; // 3
                const chunkSize = Math.floor(contentLength / PARALLEL_JOBS);
                console.log('try to split download in', PARALLEL_JOBS, 'chunks of', chunkSize, 'bytes each');
                const promises = Array.from({ length: PARALLEL_JOBS })
                    .map((_, i) => {
                    const start = chunkSize * i;
                    const end = i === PARALLEL_JOBS - 1 ? contentLength : start + (chunkSize - 1);
                    return downloadPartial(_url, start, end);
                });
                const res = yield Promise.all(promises);
                const data = Buffer.concat(res);
                // const dataSha1 = sha1(data)
                return data;
            }
        }
        let requestOptions;
        if (options && options.headers) {
            requestOptions = {
                headers: options.headers
            };
        }
        const response = yield request('GET', _url, requestOptions);
        headers = response.headers;
        // console.log('headers of GET', _url, result.statusCode, headers)
        if (headers.location) {
            _url = headers.location;
            return download(_url, onProgress, redirectCount++, options);
        }
        if (response.statusCode !== 200) {
            throw new Error('Http(s) error: response returned status code ' + response.statusCode);
        }
        // console.log('download', _url, redirectCount)
        const buf = yield downloadStreamToBuffer(response, onProgress);
        return buf;
    });
}
exports.download = download;
function downloadJson(_url) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield download(_url);
        response = JSON.parse(response.toString());
        return response;
    });
}
exports.downloadJson = downloadJson;
function downloadToFile(filePath) {
    // const dest = fso.createWriteStream(filePath);
    // downloadRaw(url, dest) 
}
//# sourceMappingURL=Downloader.js.map