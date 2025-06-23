/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  type GetObjectCommandInput,
  type PutObjectCommandInput,
  type CopyObjectCommandInput,
  type HeadObjectCommandInput,
  type DeleteObjectCommandInput
} from '@aws-sdk/client-s3'

import { sep } from 'node:path'
import { debug } from '#src/debug'
import type { Readable } from 'node:stream'
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
      Bucket: this.options.bucket
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

    await new Promise((resolve, reject) => {
      /**
       * GCS internally creates a pipeline of stream and invokes the "_destroy" method
       * at several occasions. Because of that, the "_destroy" method emits an event
       * which cannot handled within this block of code.
       *
       * So the only way I have been able to make GCS streams work is by ditching the
       * pipeline method and relying on the "pipe" method instead.
       */
      content.once('error', reject)

      try {
        const command = this.createPutObjectCommand({
          Key: key,
          Body: content,
          Bucket: this.options.bucket
        })

        return this.client
          .send(command)
          .then(() => resolve(this))
          .catch(reject)
      } catch (error) {
        reject(error)
      }
    })

    return this
  }

  /**
   * Copies the source file to the destination. Both paths must
   * be within the root location.
   */
  public async copy(from: string, to: string) {
    debug('copying file from %s to %s', from, to)

    const command = this.createCopyObjectCommand({
      Key: from,
      Bucket: this.options.bucket,
      CopySource: `/${this.options.bucket}/${to}`
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
}
