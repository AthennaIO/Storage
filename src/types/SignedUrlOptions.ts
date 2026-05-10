/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type SignedUrlMethod = 'get' | 'put'

export type SignedUrlOptions = {
  /**
   * HTTP method the signed URL should be valid for.
   *
   * @default 'get'
   */
  method?: SignedUrlMethod

  /**
   * How long the signed URL should remain valid, in seconds.
   *
   * @default 300
   */
  expiresIn?: number

  /**
   * Content-Type the client must send when uploading. Forwarded to S3 as
   * `ContentType` and folded into the signature so the URL can only be
   * used to upload a file of this type. Ignored for `'get'` URLs.
   */
  contentType?: string

  /**
   * Content-Disposition that S3 should return when serving the object
   * via this URL. Ignored for `'put'` URLs.
   */
  contentDisposition?: string

  /**
   * Content-Type that S3 should return when serving the object via
   * this URL (overrides the stored content-type). Ignored for
   * `'put'` URLs.
   */
  responseContentType?: string
}

export type SignedUrlResult = {
  /**
   * The signed URL the client should hit.
   */
  url: string

  /**
   * The HTTP method this URL was signed for.
   */
  method: SignedUrlMethod

  /**
   * The object key this URL was signed for.
   */
  key: string

  /**
   * ISO timestamp of when the signed URL stops being valid.
   */
  expiresAt: string
}
