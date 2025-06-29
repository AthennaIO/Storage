/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import mimeTypes from 'mime-types'

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  type GetObjectCommandInput,
  type PutObjectCommandInput,
  type CopyObjectCommandInput,
  type HeadObjectCommandInput,
  type DeleteObjectCommandInput,
  type ListObjectsV2CommandInput,
  type DeleteObjectsCommandInput
} from '@aws-sdk/client-s3'

import { sep } from 'node:path'
import { debug } from '#src/debug'
import type { Readable } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import { Driver } from '#src/storage/drivers/Driver'
import type { S3DriverOptions } from '#src/types/S3DriverOptions'

export class S3Driver extends Driver {
  /**
   * Driver options defined by user configurations.
   */
  private options: S3DriverOptions

  /**
   * S3 client instance to handle operations.
   */
  private client: S3Client

  public constructor(options: S3DriverOptions) {
    super()
    this.options = options
    this.client = new S3Client(options)
  }

  /**
   * Creates S3 "PutObjectCommand". Feel free to override this method to
   * manually create the command.
   */
  protected createPutObjectCommand(options: PutObjectCommandInput) {
    return new PutObjectCommand(options)
  }

  /**
   * Creates S3 "GetObjectCommand". Feel free to override this method to
   * manually create the command.
   */
  protected createGetObjectCommand(options: GetObjectCommandInput) {
    return new GetObjectCommand(options)
  }

  /**
   * Creates S3 "HeadObjectCommand". Feel free to override this method to
   * manually create the command.
   */
  protected createHeadObjectCommand(options: HeadObjectCommandInput) {
    return new HeadObjectCommand(options)
  }

  /**
   * Creates S3 "DeleteObjectCommand". Feel free to override this method to
   * manually create the command.
   */
  protected createDeleteObjectCommand(options: DeleteObjectCommandInput) {
    return new DeleteObjectCommand(options)
  }

  /**
   * Creates S3 "CopyObjectCommand". Feel free to override this method to
   * manually create the command.
   */
  protected createCopyObjectCommand(options: CopyObjectCommandInput) {
    return new CopyObjectCommand(options)
  }

  /**
   * Creates S3 "ListObjectsV2Command". Feel free to override this method to
   * manually create the command
   */
  protected createListObjectsV2Command(options: ListObjectsV2CommandInput) {
    return new ListObjectsV2Command(options)
  }

  /**
   * Creates S3 "DeleteObjectsCommand". Feel free to override this method to
   * manually create the command
   */
  protected createDeleteObjectsCommand(options: DeleteObjectsCommandInput) {
    return new DeleteObjectsCommand(options)
  }

  /**
   * Returns a boolean indicating if the file exists or not.
   */
  public async exists(key: string) {
    debug('checking if file exists %s%s%s', this.options.bucket, sep, key)

    try {
      const command = this.createHeadObjectCommand({
        Key: key,
        Bucket: this.options.bucket
      })
      const response = await this.client.send(command)

      return response.$metadata.httpStatusCode === 200
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        return false
      }

      throw error
    }
  }

  /**
   * Returns the contents of the file as a UTF-8 string. An
   * exception is thrown when the file is missing.
   */
  public async get(key: string) {
    debug('reading file contents %s%s%s', this.options.bucket, sep, key)

    const command = this.createGetObjectCommand({
      Key: key,
      Bucket: this.options.bucket
    })
    const response = await this.client.send(command)

    return response.Body!.transformToString()
  }

  /**
   * Returns the contents of the file as a stream. An
   * exception is thrown when the file is missing.
   */
  public async getStream(key: string) {
    debug(
      'reading file contents as a stream %s%s%s',
      this.options.bucket,
      sep,
      key
    )

    const command = this.createGetObjectCommand({
      Key: key,
      Bucket: this.options.bucket
    })
    const response = await this.client.send(command)

    return response.Body! as Readable
  }

  /**
   * Writes a file to the destination with the provided contents.
   *
   * - Missing directories will be created recursively.
   * - Existing file will be overwritten.
   */
  public async put(key: string, content: string | Buffer) {
    debug('creating/updating file %s%s%s', this.options.bucket, sep, key)

    const command = this.createPutObjectCommand({
      Key: key,
      Body: content,
      Bucket: this.options.bucket,
      ContentType: mimeTypes.lookup(key) as string
    })

    await this.client.send(command)

    return this
  }

  /**
   * Writes a file to the destination with the provided contents
   * as a readable stream.
   *
   * - Missing directories will be created recursively.
   * - Existing file will be overwritten.
   */
  public async putStream(key: string, content: Readable) {
    debug(
      'creating/updating file using readable stream %s%s%s',
      this.options.bucket,
      sep,
      key
    )

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.options.bucket,
        Key: key,
        Body: content,
        ContentType: mimeTypes.lookup(key) as string
      },
      queueSize: 4,
      partSize: 5 * 1024 * 1024
    })

    await upload.done()

    return this
  }

  /**
   * Copies the source file to the destination. Both paths must
   * be within the root location.
   */
  public async copy(from: string, to: string) {
    debug('copying file from %s to %s', from, to)

    const command = this.createCopyObjectCommand({
      Key: to,
      Bucket: this.options.bucket,
      CopySource: `/${this.options.bucket}/${from}`
    })

    await this.client.send(command)

    return this
  }

  /**
   * Moves the source file to the destination. Both paths must
   * be within the root location.
   */
  public async move(from: string, to: string) {
    debug('moving file from %s to %s', from, to)

    await this.copy(from, to)
    await this.delete(from)

    return this
  }

  /**
   * Deletes a file within the root location of the filesystem.
   * Attempting to delete a non-existing file will result in
   * a noop.
   */
  public async delete(key: string) {
    debug('deleting file %s%s%s', this.options.bucket, sep, key)

    const command = this.createDeleteObjectCommand({
      Key: key,
      Bucket: this.options.bucket
    })

    await this.client.send(command)

    return this
  }

  /**
   * Deletes the files and directories matching the provided
   * prefix.
   */
  public async deleteAll(prefix?: string) {
    if (!prefix) {
      debug('deleting all files from %s', this.options.bucket)

      await this.deleteAllRecursively('/')

      return this
    }

    debug(
      'deleting all files matching prefix %s%s%s',
      this.options.bucket,
      sep,
      prefix
    )

    await this.deleteAllRecursively(prefix)

    return this
  }

  private async deleteAllRecursively(
    prefix?: string,
    paginationToken?: string
  ) {
    const response = await this.client.send(
      this.createListObjectsV2Command({
        Bucket: this.options.bucket,
        ContinuationToken: paginationToken,
        ...(prefix !== '/' ? { Prefix: prefix } : {})
      })
    )

    if (!response.Contents || !response.Contents.length) {
      return
    }

    await this.client.send(
      this.createDeleteObjectsCommand({
        Bucket: this.options.bucket,
        Delete: {
          Objects: Array.from(response.Contents).map(file => {
            return {
              Key: file.Key
            }
          }),
          Quiet: true
        }
      })
    )

    if (response.NextContinuationToken) {
      debug(
        'deleting next batch of files with token %s',
        response.NextContinuationToken
      )

      await this.deleteAllRecursively(prefix, response.NextContinuationToken)
    }
  }
}
