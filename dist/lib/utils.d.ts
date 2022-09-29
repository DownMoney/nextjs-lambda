/// <reference types="replace-in-file" />
import { IOptions as GlobOptions } from 'glob';
import { IncomingMessage, ServerResponse } from 'http';
import { NextUrlWithParsedQuery } from 'next/dist/server/request-meta';
export declare const normalizeHeaders: (headers: Record<string, any>) => Record<string, string>;
export declare const requestHandler: (bucketName: string) => (req: IncomingMessage, res: ServerResponse, url?: NextUrlWithParsedQuery) => Promise<void>;
export declare enum BumpType {
    Patch = "patch",
    Minor = "minor",
    Major = "major"
}
export declare const bumpMapping: ({
    test: RegExp;
    bump: BumpType;
    scanBody?: undefined;
} | {
    test: string;
    bump: BumpType;
    scanBody: boolean;
})[];
export declare const isValidTag: (tag: string, prefix: string) => boolean;
export declare const bumpCalculator: (version: string, bumpType: BumpType) => string;
export declare const replaceVersionInCommonFiles: (oldVersion: string, newVersion: string) => import("replace-in-file").ReplaceResult[];
export declare const findInFile: (filePath: string, regex: RegExp) => string;
interface ZipFolderProps {
    outputName: string;
    folderPath: string;
    dir?: string;
}
export declare const zipFolder: ({ folderPath, outputName, dir }: ZipFolderProps) => Promise<unknown>;
interface FolderInput {
    path: string;
    dir?: string;
}
interface FileInput {
    path: string;
    name: string;
    isFile: true;
}
interface SymlinkInput {
    source: string;
    target: string;
    isSymlink: true;
}
interface GlobInput extends GlobOptions {
    path: string;
    isGlob: true;
}
interface ZipProps {
    outputName: string;
    inputDefinition: (FolderInput | FileInput | SymlinkInput | GlobInput)[];
}
export declare const zipMultipleFoldersOrFiles: ({ outputName, inputDefinition }: ZipProps) => Promise<unknown>;
interface SymlinkProps {
    sourcePath: string;
    linkLocation: string;
}
export declare const createSymlink: ({ linkLocation, sourcePath }: SymlinkProps) => void;
export declare const md5FileSync: (path: string) => string;
interface CommandProps {
    cmd: string;
    path?: string;
}
export declare const executeAsyncCmd: ({ cmd, path }: CommandProps) => Promise<unknown>;
export declare const wrapProcess: (fn: Promise<any>) => Promise<void>;
export {};
