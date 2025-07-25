## API Report File for "@fluidframework/server-services-client"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import * as api from '@fluidframework/protocol-definitions';
import { AxiosError } from 'axios';
import { AxiosInstance } from 'axios';
import { AxiosRequestConfig } from 'axios';
import type { ICreateTreeEntry } from '@fluidframework/gitresources';
import type { IQuorumSnapshot } from '@fluidframework/protocol-base';
import type { ISequencedDocumentMessage } from '@fluidframework/protocol-definitions';
import type { ISnapshotTree } from '@fluidframework/protocol-definitions';
import { ISnapshotTreeEx } from '@fluidframework/protocol-definitions';
import type { ISummaryHandle } from '@fluidframework/protocol-definitions';
import { ISummaryTree as ISummaryTree_2 } from '@fluidframework/protocol-definitions';
import type { ITokenClaims } from '@fluidframework/protocol-definitions';
import type { ITree } from '@fluidframework/gitresources';
import { ITreeEntry } from '@fluidframework/protocol-definitions';
import type { IUser } from '@fluidframework/protocol-definitions';
import { RawAxiosRequestHeaders } from 'axios';
import type * as resources from '@fluidframework/gitresources';
import type { ScopeType } from '@fluidframework/protocol-definitions';
import type { SummaryObject } from '@fluidframework/protocol-definitions';

// @internal (undocumented)
export class BasicRestWrapper extends RestWrapper {
    constructor(baseurl?: string, defaultQueryString?: Record<string, string | number | boolean>, maxBodyLength?: number, maxContentLength?: number, defaultHeaders?: RawAxiosRequestHeaders, axios?: AxiosInstance, refreshDefaultQueryString?: (() => Record<string, string | number | boolean>) | undefined, refreshDefaultHeaders?: (() => RawAxiosRequestHeaders) | undefined, getCorrelationId?: (() => string | undefined) | undefined, getTelemetryContextProperties?: (() => Record<string, string | number | boolean> | undefined) | undefined, refreshTokenIfNeeded?: ((authorizationHeader: RawAxiosRequestHeaders) => Promise<RawAxiosRequestHeaders | undefined>) | undefined, logHttpMetrics?: ((requestProps: IBasicRestWrapperMetricProps) => void) | undefined, getCallingServiceName?: (() => string | undefined) | undefined);
    // (undocumented)
    protected request<T>(requestConfig: AxiosRequestConfig, statusCode: number, canRetry?: boolean): Promise<T>;
}

// @internal
export const buildTreePath: (...nodeNames: string[]) => string;

// @internal
export const CallingServiceHeaderName = "x-calling-service";

// @internal
export const canDeleteDoc: (scopes: string[]) => boolean;

// @internal (undocumented)
export const canRead: (scopes: string[]) => boolean;

// @internal (undocumented)
export const canRevokeToken: (scopes: string[]) => boolean;

// @internal (undocumented)
export const canSummarize: (scopes: string[]) => boolean;

// @internal (undocumented)
export const canWrite: (scopes: string[]) => boolean;

// @internal (undocumented)
export const choose: () => string;

// @internal (undocumented)
export function convertAxiosErrorToNetorkError(error: AxiosError): NetworkError;

// @internal
export function convertFirstSummaryWholeSummaryTreeToSummaryTree(wholeSummaryTree: IWholeSummaryTree, unreferenced?: true | undefined): ISummaryTree;

// @internal
export function convertSortedNumberArrayToRanges(numberArray: number[]): number[][];

// @internal
export function convertSummaryTreeToWholeSummaryTree(parentHandle: string | undefined, tree: ISummaryTree, path?: string, rootNodeName?: string): IWholeSummaryTree;

// @internal
export function convertWholeFlatSummaryToSnapshotTreeAndBlobs(flatSummary: IWholeFlatSummary, treePrefixToRemove?: string): INormalizedWholeSummary;

// @internal
export const CorrelationIdHeaderName = "x-correlation-id";

// @internal
export function createFluidServiceNetworkError(statusCode: number, errorData?: INetworkErrorDetails | string): NetworkError;

// @internal
export function dedupeSortedArray<T, TSelector>(array: T[], selector: (item: T) => TSelector): T[];

// @internal (undocumented)
export const defaultHash = "00000000";

// @internal
export const DocDeleteScopeType = "doc:delete";

// @internal
export const DriverVersionHeaderName = "x-driver-version";

// @internal (undocumented)
export type ExtendedSummaryObject = SummaryObject | IEmbeddedSummaryHandle;

// @internal (undocumented)
export function generateServiceProtocolEntries(deli: string, scribe: string): ITreeEntry[];

// @internal
export function generateToken(tenantId: string, documentId: string, key: string, scopes: ScopeType[], user?: IUser, lifetime?: number, ver?: string): string;

// @internal (undocumented)
export function generateUser(): IUser;

// @internal (undocumented)
export const getAuthorizationTokenFromCredentials: (credentials: ICredentials) => string;

// @internal
export const getGlobalAbortControllerContext: () => IAbortControllerContext;

// @internal
export const getGlobalTimeoutContext: () => ITimeoutContext;

// @internal (undocumented)
export function getNextHash(message: ISequencedDocumentMessage, lastHash: string): string;

// @internal (undocumented)
export function getOrCreateRepository(endpoint: string, owner: string, repository: string, headers?: RawAxiosRequestHeaders): Promise<void>;

// @internal (undocumented)
export function getQuorumTreeEntries(minimumSequenceNumber: number, sequenceNumber: number, quorumSnapshot: IQuorumSnapshot): ITreeEntry[];

// @internal
export const getRandomInt: (range: number) => number;

// @internal (undocumented)
export function getRandomName(connector?: string, capitalize?: boolean): string;

// @internal (undocumented)
export class GitManager implements IGitManager {
    constructor(historian: IHistorian);
    // (undocumented)
    addBlob(blob: resources.IBlob): void;
    // (undocumented)
    addCommit(commit: resources.ICommit): void;
    // (undocumented)
    addRef(ref: string, sha: string): void;
    // (undocumented)
    addTree(tree: resources.ITree): void;
    // (undocumented)
    createBlob(content: string, encoding: "utf-8" | "base64"): Promise<resources.ICreateBlobResponse>;
    // (undocumented)
    createCommit(commit: resources.ICreateCommitParams): Promise<resources.ICommit>;
    // (undocumented)
    createGitTree(params: resources.ICreateTreeParams): Promise<resources.ITree>;
    // (undocumented)
    createRef(branch: string, sha: string): Promise<resources.IRef>;
    // (undocumented)
    createSummary(summary: IWholeSummaryPayload, initial?: boolean): Promise<IWriteSummaryResponse>;
    // (undocumented)
    createTree(files: api.ITree): Promise<resources.ITree>;
    // (undocumented)
    deleteSummary(softDelete: boolean): Promise<void>;
    // (undocumented)
    getBlob(sha: string): Promise<resources.IBlob>;
    // (undocumented)
    getCommit(sha: string): Promise<resources.ICommit>;
    getCommits(shaOrRef: string, count: number): Promise<resources.ICommitDetails[]>;
    getContent(commit: string, path: string): Promise<resources.IBlob>;
    // (undocumented)
    getFullTree(sha: string): Promise<any>;
    // (undocumented)
    getHeader(id: string, sha: string): Promise<api.ISnapshotTree>;
    // (undocumented)
    getRawUrl(sha: string): string;
    // (undocumented)
    getRef(ref: string): Promise<resources.IRef | null>;
    // (undocumented)
    getSummary(sha: string): Promise<IWholeFlatSummary>;
    getTree(root: string, recursive?: boolean): Promise<resources.ITree>;
    // (undocumented)
    upsertRef(branch: string, commitSha: string): Promise<resources.IRef>;
    write(branch: string, inputTree: api.ITree, parents: string[], message: string): Promise<resources.ICommit>;
}

// @internal
export class Heap<T> {
    constructor(comparator: IHeapComparator<T>);
    // (undocumented)
    peek(): T | undefined;
    // (undocumented)
    pop(): T | undefined;
    // (undocumented)
    push(value: T): void;
    // (undocumented)
    get size(): number;
}

// @internal
export class Historian implements IHistorian {
    constructor(endpoint: string, historianApi: boolean, disableCache: boolean, restWrapper?: RestWrapper);
    // (undocumented)
    createBlob(blob: resources.ICreateBlobParams): Promise<resources.ICreateBlobResponse>;
    // (undocumented)
    createCommit(commit: resources.ICreateCommitParams): Promise<resources.ICommit>;
    // (undocumented)
    createRef(params: resources.ICreateRefParams): Promise<resources.IRef>;
    // (undocumented)
    createSummary(summary: IWholeSummaryPayload, initial?: boolean): Promise<IWriteSummaryResponse>;
    // (undocumented)
    createTag(tag: resources.ICreateTagParams): Promise<resources.ITag>;
    // (undocumented)
    createTree(tree: resources.ICreateTreeParams): Promise<resources.ITree>;
    // (undocumented)
    deleteRef(ref: string): Promise<void>;
    // (undocumented)
    deleteSummary(softDelete: boolean): Promise<void>;
    // (undocumented)
    endpoint: string;
    // (undocumented)
    getBlob(sha: string): Promise<resources.IBlob>;
    // (undocumented)
    getCommit(sha: string): Promise<resources.ICommit>;
    // (undocumented)
    getCommits(sha: string, count: number): Promise<resources.ICommitDetails[]>;
    // (undocumented)
    getContent(path: string, ref: string): Promise<any>;
    // (undocumented)
    getFullTree(sha: string): Promise<any>;
    // (undocumented)
    getHeader(sha: string): Promise<any>;
    // (undocumented)
    getRef(ref: string): Promise<resources.IRef>;
    // (undocumented)
    getRefs(): Promise<resources.IRef[]>;
    // (undocumented)
    getSummary(sha: string): Promise<IWholeFlatSummary>;
    // (undocumented)
    getTag(tag: string): Promise<resources.ITag>;
    // (undocumented)
    getTree(sha: string, recursive: boolean): Promise<resources.ITree>;
    // (undocumented)
    updateRef(ref: string, params: resources.IPatchRefParams): Promise<resources.IRef>;
}

// @internal
export interface IAbortControllerContext {
    bindAbortController(abortController: AbortController, callback: () => void): void;
    bindAbortControllerAsync<T>(abortController: AbortController, callback: () => Promise<T>): Promise<T>;
    getAbortController(): AbortController | undefined;
}

// @internal (undocumented)
export interface IAlfredTenant {
    // (undocumented)
    id: string;
    // (undocumented)
    key: string;
}

// @internal (undocumented)
export interface IBasicRestWrapperMetricProps {
    // (undocumented)
    axiosError: AxiosError<any>;
    // (undocumented)
    baseUrl: string;
    // (undocumented)
    correlationId: string;
    // (undocumented)
    durationInMs: number;
    // (undocumented)
    method: string;
    // (undocumented)
    status: number | string;
    // (undocumented)
    timeoutInMs: number | string;
    // (undocumented)
    url: string;
}

// @internal
export interface ICreateRefParamsExternal extends resources.ICreateRefParams {
    // (undocumented)
    config?: IExternalWriterConfig;
}

// @internal (undocumented)
export interface ICredentials {
    // (undocumented)
    password: string;
    // (undocumented)
    user: string;
}

// @internal (undocumented)
export interface IEmbeddedSummaryHandle extends ISummaryHandle {
    // (undocumented)
    embedded: boolean;
}

// @internal (undocumented)
export interface IExternalWriterConfig {
    // (undocumented)
    enabled: boolean;
}

// @internal
export interface IGetRefParamsExternal {
    // (undocumented)
    config?: IExternalWriterConfig;
}

// @internal
export interface IGitCache {
    // (undocumented)
    blobs: resources.IBlob[];
    // (undocumented)
    commits: resources.ICommit[];
    // (undocumented)
    refs: {
        [key: string]: string;
    };
    // (undocumented)
    trees: resources.ITree[];
}

// @internal (undocumented)
export interface IGitManager {
    // (undocumented)
    createBlob(content: string, encoding: string): Promise<resources.ICreateBlobResponse>;
    // (undocumented)
    createCommit(commit: resources.ICreateCommitParams): Promise<resources.ICommit>;
    // (undocumented)
    createGitTree(params: resources.ICreateTreeParams): Promise<resources.ITree>;
    // (undocumented)
    createRef(branch: string, sha: string): Promise<resources.IRef>;
    // (undocumented)
    createSummary(summary: IWholeSummaryPayload, initial?: boolean): Promise<IWriteSummaryResponse>;
    // (undocumented)
    createTree(files: api.ITree): Promise<resources.ITree>;
    // (undocumented)
    deleteSummary(softDelete: boolean): Promise<void>;
    // (undocumented)
    getBlob(sha: string): Promise<resources.IBlob>;
    // (undocumented)
    getCommit(sha: string): Promise<resources.ICommit>;
    // (undocumented)
    getCommits(sha: string, count: number): Promise<resources.ICommitDetails[]>;
    // (undocumented)
    getContent(commit: string, path: string): Promise<resources.IBlob>;
    // (undocumented)
    getFullTree(sha: string): Promise<any>;
    // (undocumented)
    getHeader(id: string, sha: string): Promise<api.ISnapshotTree>;
    // (undocumented)
    getRawUrl(sha: string): string;
    // (undocumented)
    getRef(ref: string): Promise<resources.IRef | null>;
    // (undocumented)
    getSummary(sha: string): Promise<IWholeFlatSummary>;
    // (undocumented)
    getTree(root: string, recursive: boolean): Promise<resources.ITree>;
    // (undocumented)
    upsertRef(branch: string, commitSha: string): Promise<resources.IRef>;
    // (undocumented)
    write(branch: string, inputTree: api.ITree, parents: string[], message: string): Promise<resources.ICommit>;
}

// @internal
export interface IGitService {
    // (undocumented)
    createBlob(blob: resources.ICreateBlobParams): Promise<resources.ICreateBlobResponse>;
    // (undocumented)
    createCommit(commit: resources.ICreateCommitParams): Promise<resources.ICommit>;
    // (undocumented)
    createRef(params: resources.ICreateRefParams): Promise<resources.IRef>;
    // (undocumented)
    createSummary(summary: IWholeSummaryPayload, initial?: boolean): Promise<IWriteSummaryResponse>;
    // (undocumented)
    createTag(tag: resources.ICreateTagParams): Promise<resources.ITag>;
    // (undocumented)
    createTree(tree: resources.ICreateTreeParams): Promise<resources.ITree>;
    // (undocumented)
    deleteRef(ref: string): Promise<void>;
    // (undocumented)
    deleteSummary(softDelete: boolean): Promise<void>;
    // (undocumented)
    getBlob(sha: string): Promise<resources.IBlob>;
    // (undocumented)
    getCommit(sha: string): Promise<resources.ICommit>;
    // (undocumented)
    getCommits(sha: string, count: number): Promise<resources.ICommitDetails[]>;
    // (undocumented)
    getContent(path: string, ref: string): Promise<any>;
    // (undocumented)
    getRef(ref: string): Promise<resources.IRef | null>;
    // (undocumented)
    getRefs(): Promise<resources.IRef[]>;
    // (undocumented)
    getSummary(sha: string): Promise<IWholeFlatSummary>;
    // (undocumented)
    getTag(tag: string): Promise<resources.ITag>;
    // (undocumented)
    getTree(sha: string, recursive: boolean): Promise<resources.ITree>;
    // (undocumented)
    updateRef(ref: string, params: resources.IPatchRefParams): Promise<resources.IRef>;
}

// @internal
export interface IHeapComparator<T> {
    // (undocumented)
    compareFn(a: T, b: T): number;
}

// @internal
export interface IHistorian extends IGitService {
    // (undocumented)
    endpoint: string;
    // (undocumented)
    getFullTree(sha: string): Promise<any>;
    getHeader(sha: string): Promise<resources.IHeader>;
}

// @internal
export interface INetworkErrorDetails {
    canRetry?: boolean;
    internalErrorCode?: InternalErrorCode;
    isFatal?: boolean;
    message?: string;
    retryAfter?: number;
    retryAfterMs?: number;
    source?: string;
}

// @internal
export interface INormalizedWholeSummary {
    // (undocumented)
    blobs: Map<string, ArrayBuffer>;
    // (undocumented)
    sequenceNumber: number | undefined;
    // (undocumented)
    snapshotTree: ISnapshotTree;
}

// @internal
export enum InternalErrorCode {
    ClusterDraining = "ClusterDraining",
    TokenRevoked = "TokenRevoked"
}

// @internal
export interface IPatchRefParamsExternal extends resources.IPatchRefParams {
    // (undocumented)
    config?: IExternalWriterConfig;
}

// @alpha
export interface ISession {
    deltaStreamUrl: string;
    historianUrl: string;
    ignoreSessionStickiness?: boolean;
    isSessionActive: boolean;
    isSessionAlive: boolean;
    messageBrokerId?: string;
    ordererUrl: string;
}

// @internal (undocumented)
export function isNetworkError(error: unknown): error is NetworkError;

// @internal (undocumented)
export interface ISummaryTree extends ISummaryTree_2 {
    // (undocumented)
    tree: {
        [path: string]: ExtendedSummaryObject;
    };
}

// @internal
export interface ISummaryUploadManager {
    writeSummaryTree(summaryTree: api.ISummaryTree, parentHandle: string, summaryType: IWholeSummaryPayloadType, sequenceNumber?: number): Promise<string>;
}

// @internal
export interface ITimeoutContext {
    bindTimeout(maxDurationMs: number, callback: () => void): void;
    bindTimeoutAsync<T>(maxDurationMs: number, callback: () => Promise<T>): Promise<T>;
    checkTimeout(): void;
    getTimeRemainingMs(): number | undefined;
}

// @internal (undocumented)
export interface IWholeFlatSummary {
    // (undocumented)
    blobs?: IWholeFlatSummaryBlob[];
    // (undocumented)
    id: string;
    // (undocumented)
    trees: IWholeFlatSummaryTree[];
}

// @internal (undocumented)
export interface IWholeFlatSummaryBlob {
    // (undocumented)
    content: string;
    // (undocumented)
    encoding: "base64" | "utf-8";
    // (undocumented)
    id: string;
    // (undocumented)
    size: number;
}

// @internal (undocumented)
export interface IWholeFlatSummaryTree {
    // (undocumented)
    entries: IWholeFlatSummaryTreeEntry[];
    // (undocumented)
    id: string;
    // (undocumented)
    sequenceNumber: number;
}

// @internal (undocumented)
export type IWholeFlatSummaryTreeEntry = IWholeFlatSummaryTreeEntryTree | IWholeFlatSummaryTreeEntryBlob;

// @internal (undocumented)
export interface IWholeFlatSummaryTreeEntryBlob {
    // (undocumented)
    id: string;
    // (undocumented)
    path: string;
    // (undocumented)
    type: "blob";
}

// @internal (undocumented)
export interface IWholeFlatSummaryTreeEntryTree {
    // (undocumented)
    path: string;
    // (undocumented)
    type: "tree";
    // (undocumented)
    unreferenced?: true;
}

// @internal (undocumented)
export interface IWholeSummaryBlob {
    // (undocumented)
    content: string;
    // (undocumented)
    encoding: "base64" | "utf-8";
    // (undocumented)
    type: "blob";
}

// @internal (undocumented)
export interface IWholeSummaryPayload {
    // (undocumented)
    entries: WholeSummaryTreeEntry[];
    // (undocumented)
    message: string;
    // (undocumented)
    sequenceNumber: number;
    // (undocumented)
    summaryTime?: string;
    // (undocumented)
    type: IWholeSummaryPayloadType;
}

// @internal (undocumented)
export type IWholeSummaryPayloadType = "container" | "channel";

// @internal (undocumented)
export interface IWholeSummaryTree {
    // (undocumented)
    entries?: WholeSummaryTreeEntry[];
    // (undocumented)
    type: "tree";
}

// @internal (undocumented)
export interface IWholeSummaryTreeBaseEntry {
    // (undocumented)
    path: string;
    // (undocumented)
    type: "blob" | "tree" | "commit";
}

// @internal (undocumented)
export interface IWholeSummaryTreeHandleEntry extends IWholeSummaryTreeBaseEntry {
    // (undocumented)
    id: string;
}

// @internal (undocumented)
export interface IWholeSummaryTreeValueEntry extends IWholeSummaryTreeBaseEntry {
    // (undocumented)
    unreferenced?: true;
    // (undocumented)
    value: WholeSummaryTreeValue;
}

// @internal (undocumented)
export interface IWriteSummaryResponse {
    // (undocumented)
    id: string;
}

// @internal
export const LatestSummaryId = "latest";

// @internal (undocumented)
export function mergeAppAndProtocolTree(appSummaryTree: ITree, protocolTree: ITree): ICreateTreeEntry[];

// @internal
export function mergeKArrays<T>(arrays: T[][], comparator: (a: T, b: T) => number): T[];

// @internal
export function mergeSortedArrays<T>(arr1: T[], arr2: T[], comparator: (item1: T, item2: T) => number): T[];

// @internal
export class NetworkError extends Error {
    constructor(
    code: number,
    message: string,
    canRetry?: boolean | undefined,
    isFatal?: boolean | undefined,
    retryAfterMs?: number | undefined,
    source?: string | undefined,
    internalErrorCode?: InternalErrorCode | undefined);
    // @public
    readonly canRetry?: boolean | undefined;
    // @public
    readonly code: number;
    get details(): INetworkErrorDetails | string;
    readonly internalErrorCode?: InternalErrorCode | undefined;
    // @public
    readonly isFatal?: boolean | undefined;
    readonly retryAfter?: number;
    // @public
    readonly retryAfterMs?: number | undefined;
    // @public
    readonly source?: string | undefined;
    toJSON(): INetworkErrorDetails & {
        code: number;
    };
}

// @internal (undocumented)
export function parseToken(tenantId: string, authorization: string | undefined): string | undefined;

// @internal (undocumented)
export function promiseTimeout(mSec: number, promise: Promise<any>): Promise<any>;

// @internal
export class RestLessClient {
    translate(request: AxiosRequestConfig): AxiosRequestConfig;
}

// @internal (undocumented)
export enum RestLessFieldNames {
    // (undocumented)
    Body = "body",
    // (undocumented)
    Header = "header",
    // (undocumented)
    Method = "method"
}

// @internal (undocumented)
export abstract class RestWrapper {
    constructor(baseurl?: string | undefined, defaultQueryString?: Record<string, string | number | boolean>, maxBodyLength?: number, maxContentLength?: number);
    // (undocumented)
    protected readonly baseurl?: string | undefined;
    // (undocumented)
    protected defaultQueryString: Record<string, string | number | boolean>;
    // (undocumented)
    delete<T>(url: string, queryString?: Record<string, string | number | boolean>, headers?: RawAxiosRequestHeaders, additionalOptions?: Partial<Omit<AxiosRequestConfig, "baseURL" | "headers" | "maxBodyLength" | "maxContentLength" | "method" | "url">>): Promise<T>;
    // (undocumented)
    protected generateQueryString(queryStringValues: Record<string, string | number | boolean> | undefined): string;
    // (undocumented)
    get<T>(url: string, queryString?: Record<string, string | number | boolean>, headers?: RawAxiosRequestHeaders, additionalOptions?: Partial<Omit<AxiosRequestConfig, "baseURL" | "headers" | "maxBodyLength" | "maxContentLength" | "method" | "url">>): Promise<T>;
    // (undocumented)
    protected readonly maxBodyLength: number;
    // (undocumented)
    protected readonly maxContentLength: number;
    // (undocumented)
    patch<T>(url: string, requestBody: any, queryString?: Record<string, string | number | boolean>, headers?: RawAxiosRequestHeaders, additionalOptions?: Partial<Omit<AxiosRequestConfig, "baseURL" | "headers" | "maxBodyLength" | "maxContentLength" | "method" | "url">>): Promise<T>;
    // (undocumented)
    post<T>(url: string, requestBody: any, queryString?: Record<string, string | number | boolean>, headers?: RawAxiosRequestHeaders, additionalOptions?: Partial<Omit<AxiosRequestConfig, "baseURL" | "headers" | "maxBodyLength" | "maxContentLength" | "method" | "url">>): Promise<T>;
    // (undocumented)
    protected abstract request<T>(options: AxiosRequestConfig, statusCode: number): Promise<T>;
}

// @internal
export const setGlobalAbortControllerContext: (abortControllerContext: IAbortControllerContext) => void;

// @internal
export const setGlobalTimeoutContext: (timeoutContext: ITimeoutContext) => void;

// @internal (undocumented)
export function setupAxiosInterceptorsForAbortSignals(getAbortController: () => AbortController | undefined): void;

// @internal
export class SummaryTreeUploadManager implements ISummaryUploadManager {
    constructor(manager: IGitManager, blobsShaCache: Map<string, string>, getPreviousFullSnapshot: (parentHandle: string) => Promise<ISnapshotTreeEx | null | undefined>);
    // (undocumented)
    writeSummaryTree(summaryTree: ISummaryTree_2, parentHandle: string, summaryType: IWholeSummaryPayloadType, sequenceNumber?: number, initial?: boolean): Promise<string>;
}

// @internal
export const TelemetryContextHeaderName = "x-telemetry-context";

// @internal
export function throwFluidServiceNetworkError(statusCode: number, errorData?: INetworkErrorDetails | string): never;

// @internal
export const TokenRevokeScopeType = "token:revoke";

// @internal
export function validateTokenClaims(token: string, documentId: string, tenantId: string): ITokenClaims;

// @internal
export function validateTokenClaimsExpiration(claims: ITokenClaims, maxTokenLifetimeSec: number): number;

// @internal (undocumented)
export type WholeSummaryTreeEntry = IWholeSummaryTreeValueEntry | IWholeSummaryTreeHandleEntry;

// @internal (undocumented)
export type WholeSummaryTreeValue = IWholeSummaryTree | IWholeSummaryBlob;

// @internal
export class WholeSummaryUploadManager implements ISummaryUploadManager {
    constructor(manager: IGitManager);
    // (undocumented)
    writeSummaryTree(summaryTree: ISummaryTree, parentHandle: string | undefined, summaryType: IWholeSummaryPayloadType, sequenceNumber?: number, initial?: boolean): Promise<string>;
}

// (No @packageDocumentation comment for this package)

```
