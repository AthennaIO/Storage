/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  DriverOptions,
  FSDriverOptions,
  S3DriverOptions,
  FakeDriverOptions
} from '#src/types'
import { Macroable } from '@athenna/common'
import type { Readable } from 'node:stream'
import { DriverFactory } from '#src/factories/DriverFactory'
import type { FSDriver } from '#src/storage/drivers/FSDriver'
import type { S3Driver } from '#src/storage/drivers/S3Driver'
import type { FakeDriver } from '#src/storage/drivers/FakeDriver'
import type { Driver as DriverImpl } from '#src/storage/drivers/Driver'

export class StorageImpl<Driver extends DriverImpl = any> extends Macroable {
  /**
   * The current driver instance responsible to maintain
   * the files storage.
   */
  public driver: Driver = null

  /**
   * The disk name used for this instance.
   */
  public diskName = Config.get('storage.default')

  public constructor(options?: DriverOptions) {
    super()

    this.driver = DriverFactory.fabricate(this.diskName, options)
  }

  public disk(name: 'fs', options?: FSDriverOptions): StorageImpl<FSDriver>
  public disk(name: 's3', options?: S3DriverOptions): StorageImpl<S3Driver>
  public disk(
    name: 'fake',
    options?: FakeDriverOptions
  ): StorageImpl<typeof FakeDriver>

  public disk(
    name: 'fs' | 's3' | 'fake' | string,
    options?: Record<string, any>
  ):
    | StorageImpl<FSDriver>
    | StorageImpl<S3Driver>
    | StorageImpl<typeof FakeDriver>

  public disk(name: string, options?: DriverOptions) {
    this.driver = DriverFactory.fabricate(name, options)

    const driver = DriverFactory.fabricate(name)
    const storage = new StorageImpl<typeof driver>()

    storage.diskName = name
    storage.driver = driver

    return storage
  }

  /**
   * Returns a boolean indicating if the file exists or not.
   */
  public async exists(key: string) {
    return this.driver.exists(key)
  }

  /**
   * Returns the contents of the file as a UTF-8 string. An
   * exception is thrown when the file is missing.
   */
  public async get(key: string) {
    return this.driver.get(key)
  }

  /**
   * Returns the contents of the file as a stream. An
   * exception is thrown when the file is missing.
   */
  public async getStream(key: string) {
    return this.driver.getStream(key)
  }

  /**
   * Writes a file to the destination with the provided contents.
   *
   * - Missing directories will be created recursively.
   * - Existing file will be overwritten.
   */
  public async put(key: string, content: string | Buffer) {
    await this.driver.put(key, content)

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
    await this.driver.putStream(key, content)

    return this
  }

  /**
   * Copies the source file to the destination. Both paths must
   * be within the root location.
   */
  public async copy(from: string, to: string) {
    await this.driver.copy(from, to)

    return this
  }

  /**
   * Moves the source file to the destination. Both paths must
   * be within the root location.
   */
  public async move(from: string, to: string) {
    await this.driver.move(from, to)

    return this
  }

  /**
   * Deletes a file within the root location of the filesystem.
   * Attempting to delete a non-existing file will result in
   * a noop.
   */
  public async delete(key: string) {
    await this.driver.delete(key)

    return this
  }
}
