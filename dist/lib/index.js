'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var NextServer = require('next/dist/server/next-server');
var slsHttp = require('serverless-http');
var configShared = require('next/dist/server/config-shared');
var imageOptimizer = require('next/dist/server/image-optimizer');
var clientS3 = require('@aws-sdk/client-s3');
require('archiver');
require('fs');
require('replace-in-file');
require('crypto');
require('child_process');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n["default"] = e;
	return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespace(path);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var NextServer__default = /*#__PURE__*/_interopDefaultLegacy(NextServer);
var slsHttp__default = /*#__PURE__*/_interopDefaultLegacy(slsHttp);

const sharpLayerZipPath = path__namespace.resolve(__dirname, './sharp-layer.zip');
const imageHandlerZipPath = path__namespace.resolve(__dirname, './image-handler.zip');
const serverHandlerZipPath = path__namespace.resolve(__dirname, './server-handler.zip');
path__namespace.resolve(__dirname, './next-layer.zip');
path__namespace.resolve(__dirname, '../cdk');

var _a$1;
// ! This is needed for nextjs to correctly resolve.
process.chdir(__dirname);
process.env.NODE_ENV = 'production';
// This will be loaded from custom config parsed via CLI.
const nextConf = require(`${(_a$1 = process.env.NEXT_CONFIG_FILE) !== null && _a$1 !== void 0 ? _a$1 : './config.json'}`);
const config = {
    hostname: 'localhost',
    port: Number(process.env.PORT) || 3000,
    dir: path__default["default"].join(__dirname),
    dev: false,
    customServer: false,
    conf: nextConf,
};
const getErrMessage = (e) => ({ message: 'Server failed to respond.', details: e });
const nextHandler = new NextServer__default["default"](config).getRequestHandler();
const server = slsHttp__default["default"](async (req, res) => {
    await nextHandler(req, res).catch((e) => {
        // Log into Cloudwatch for easier debugging.
        console.error(`NextJS request failed due to:`);
        console.error(e);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(getErrMessage(e), null, 3));
    });
}, {
    // We have separate function for handling images. Assets are handled by S3.
    binary: false,
});
const handler$1 = server;

// Make header keys lowercase to ensure integrity.
const normalizeHeaders = (headers) => Object.entries(headers).reduce((acc, [key, value]) => ({ ...acc, [key.toLowerCase()]: value }), {});
// Handle fetching of S3 object before optimization happens in nextjs.
const requestHandler = (bucketName) => async (req, res, url) => {
    if (!url) {
        throw new Error('URL is missing from request.');
    }
    // S3 expects keys without leading `/`
    const trimmedKey = url.href.startsWith('/') ? url.href.substring(1) : url.href;
    const client = new clientS3.S3Client({});
    const response = await client.send(new clientS3.GetObjectCommand({ Bucket: bucketName, Key: trimmedKey }));
    if (!response.Body) {
        throw new Error(`Could not fetch image ${trimmedKey} from bucket.`);
    }
    const stream = response.Body;
    const data = await new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.once('end', () => resolve(Buffer.concat(chunks)));
        stream.once('error', reject);
    });
    res.statusCode = 200;
    if (response.ContentType) {
        res.setHeader('Content-Type', response.ContentType);
    }
    if (response.CacheControl) {
        res.setHeader('Cache-Control', response.CacheControl);
    }
    res.write(data);
    res.end();
};
var BumpType;
(function (BumpType) {
    BumpType["Patch"] = "patch";
    BumpType["Minor"] = "minor";
    BumpType["Major"] = "major";
})(BumpType || (BumpType = {}));
[
    {
        test: /(.*)(fix:|fix\((.*)\):)/,
        bump: BumpType.Patch,
    },
    {
        test: /(.*)(chore:|chore\((.*)\):)/,
        bump: BumpType.Patch,
    },
    {
        test: /(.*)(feat:|feat\((.*)\):|feature:|feature\((.*)\):)/,
        bump: BumpType.Minor,
    },
    {
        test: /(.*)(perf:|perf\((.*)\):)/,
        bump: BumpType.Minor,
    },
    {
        test: /(.*)(ref:|ref\((.*)\):|refactor:|refactor\((.*)\):|refactoring:|refactoring\((.*)\):)/,
        bump: BumpType.Minor,
    },
    {
        test: /(.*)(revert:|revert\((.*)\):)/,
        bump: BumpType.Patch,
    },
    {
        test: /(.*)(style:|style\((.*)\):)/,
        bump: BumpType.Minor,
    },
    {
        test: /(.*)(test:|test\((.*)\):|tests:|tests\((.*)\):)/,
        bump: BumpType.Minor,
    },
    {
        test: /(.*)(ci:|ci\((.*)\):)/,
        bump: BumpType.Minor,
    },
    {
        test: /(.*)(build:|build\((.*)\):)/,
        bump: BumpType.Minor,
    },
    {
        test: /(.*)(docs:|docs\((.*)\):|doc:|doc\((.*)\):)/,
        bump: BumpType.Patch,
    },
    {
        test: 'BREAKING CHANGE',
        bump: BumpType.Major,
        scanBody: true,
    },
];

var _a;
// ! Make sure this comes before the fist import
process.env.NEXT_SHARP_PATH = require.resolve('sharp');
process.env.NODE_ENV = 'production';
const sourceBucket = (_a = process.env.S3_SOURCE_BUCKET) !== null && _a !== void 0 ? _a : undefined;
// @TODO: Allow passing params as env vars.
const nextConfig = {
    ...configShared.defaultConfig,
    images: {
        ...configShared.defaultConfig.images,
        // ...(domains && { domains }),
        // ...(deviceSizes && { deviceSizes }),
        // ...(formats && { formats }),
        // ...(imageSizes && { imageSizes }),
        // ...(dangerouslyAllowSVG && { dangerouslyAllowSVG }),
        // ...(contentSecurityPolicy && { contentSecurityPolicy }),
    },
};
const optimizer = async (event) => {
    try {
        if (!sourceBucket) {
            throw new Error('Bucket name must be defined!');
        }
        const imageParams = imageOptimizer.ImageOptimizerCache.validateParams({ headers: event.headers }, event.queryStringParameters, nextConfig, false);
        if ('errorMessage' in imageParams) {
            throw new Error(imageParams.errorMessage);
        }
        const optimizedResult = await imageOptimizer.imageOptimizer({ headers: normalizeHeaders(event.headers) }, {}, // res object is not necessary as it's not actually used.
        imageParams, nextConfig, false, // not in dev mode
        requestHandler(sourceBucket));
        return {
            statusCode: 200,
            body: optimizedResult.buffer.toString('base64'),
            isBase64Encoded: true,
            headers: { Vary: 'Accept', 'Content-Type': optimizedResult.contentType },
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: (error === null || error === void 0 ? void 0 : error.message) || (error === null || error === void 0 ? void 0 : error.toString()) || error,
        };
    }
};
const handler = optimizer;

exports.imageHandler = handler;
exports.imageHandlerZipPath = imageHandlerZipPath;
exports.serverHandler = handler$1;
exports.serverHandlerZipPath = serverHandlerZipPath;
exports.sharpLayerZipPath = sharpLayerZipPath;
