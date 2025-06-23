/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { S3ClientConfig } from '@aws-sdk/client-s3'

export type S3DriverOptions = {
  /**
   * The bucket from which to read and write files
   */
  bucket: string
} & S3ClientConfig
