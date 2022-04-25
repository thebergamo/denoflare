import { checkMatches } from '../check.ts';
import { ExtendedXmlNode, parseXml } from '../xml_parser.ts';
import { AwsCallContext, BucketResultOwner, parseBucketResultOwner, R2, s3Fetch, throwIfUnexpectedContentType, throwIfUnexpectedStatus } from './r2.ts';
import { KnownElement } from './known_element.ts';

export async function listObjectsV2(opts: { bucket: string, origin: string, region: string, maxKeys?: number, continuationToken?: string, delimiter?: string, prefix?: string, startAfter?: string, encodingType?: string }, context: AwsCallContext): Promise<ListBucketResult> {
    const { bucket, origin, region, maxKeys, continuationToken, delimiter, prefix, startAfter, encodingType } = opts;
    const method = 'GET';
    const url = new URL(`${origin}/${bucket}/?list-type=2`);
    if (typeof maxKeys === 'number') url.searchParams.set('max-keys', String(maxKeys));
    if (typeof continuationToken === 'string') url.searchParams.set('continuation-token', continuationToken);
    if (typeof delimiter === 'string') url.searchParams.set('delimiter', delimiter);
    if (typeof prefix === 'string') url.searchParams.set('prefix', prefix);
    if (typeof startAfter === 'string') url.searchParams.set('start-after', startAfter);
    if (typeof encodingType === 'string') url.searchParams.set('encoding-type', encodingType);

    const res = await s3Fetch({ method, url, region, context });
    await throwIfUnexpectedStatus(res, 200);
  
    const txt = await res.text();
    if (R2.DEBUG) console.log(txt);
    throwIfUnexpectedContentType(res, 'application/xml', txt);

    const xml = parseXml(txt);
    return parseListBucketResultXml(xml);
}

//

export interface ListBucketResult {
    readonly isTruncated: boolean;
    readonly name: string;
    readonly prefix?: string;
    readonly maxKeys: number;
    readonly contents: ListBucketResultItem[];
    readonly commonPrefixes?: readonly string[];
    readonly keyCount: number;
    readonly continuationToken?: string;
    readonly nextContinuationToken?: string;
    readonly delimiter?: string;
    readonly startAfter?: string;
    readonly encodingType?: string;
}

export interface ListBucketResultItem {
    readonly key: string;
    readonly size: number;
    readonly lastModified: string;
    readonly owner: BucketResultOwner;
    readonly etag: string;
}

//

function parseListBucketResultXml(xml: ExtendedXmlNode): ListBucketResult {
    const doc = new KnownElement(xml).checkTagName('!xml');
    const rt = parseListBucketResult(doc.getKnownElement('ListBucketResult'));
    doc.check();
    return rt;
}

function parseListBucketResult(element: KnownElement): ListBucketResult {
    const name = element.getElementText('Name');
    const contents = element.getKnownElements('Contents').map(parseListBucketResultItem);
    const isTruncated = element.getCheckedElementText('IsTruncated', checkBoolean);
    const maxKeys = element.getCheckedElementText('MaxKeys', checkInteger);
    const keyCount = element.getCheckedElementText('KeyCount', checkInteger);
    const nextContinuationToken = element.getOptionalElementText('NextContinuationToken');
    const delimiter = element.getOptionalElementText('Delimiter');
    const startAfter = element.getOptionalElementText('StartAfter');
    const prefix = element.getOptionalElementText('Prefix');
    const encodingType = element.getOptionalElementText('EncodingType');
    const commonPrefixes = parseCommonPrefixes(element.getOptionalKnownElement('CommonPrefixes'));
    element.check();
    return { name, isTruncated, maxKeys, keyCount, contents, nextContinuationToken, delimiter, commonPrefixes, startAfter, prefix, encodingType };
}

function checkInteger(text: string, name: string): number {
    const rt = parseInt(text);
    if (String(rt) !== text) throw new Error(`${name}: Expected integer text`);
    return rt;
}

function checkBoolean(text: string, name: string): boolean {
    checkMatches(name, text, /^(true|false)$/);
    return text === 'true';
}

function parseListBucketResultItem(element: KnownElement): ListBucketResultItem {
    const key = element.getElementText('Key');
    const size = element.getCheckedElementText('Size', checkInteger);
    const lastModified = element.getElementText('LastModified');
    const owner = parseBucketResultOwner(element.getKnownElement('Owner'));
    const etag = element.getElementText('ETag');
    element.check();
    return { key, size, lastModified, owner, etag };
}

function parseCommonPrefixes(element: KnownElement | undefined): string[] | undefined {
    if (element === undefined) return undefined;
    const rt = element.getElementTexts('Prefix');
    element.check();
    return rt;
}
