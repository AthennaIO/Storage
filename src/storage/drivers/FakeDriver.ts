/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { debug } from '#src/debug'
import { PassThrough, type Readable } from 'node:stream'
import type { FakeDriverOptions } from '#src/types/FakeDriverOptions'

export class FakeDriver {
  /**
   * Driver options defined by user configurations.
   */
  private static options: FakeDriverOptions

  public constructor(options: FakeDriverOptions) {
    FakeDriver.options = options

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return FakeDriver
  }

  /**
   * Returns a boolean indicating if the file exists or not.
   */
  public static async exists(key: string) {
    debug('checking if file exists %s%s%s', this.options.root, sep, key)

    return true
  }

  /**
   * Returns the contents of the file as a UTF-8 string. An
   * exception is thrown when the file is missing.
   */
  public static async get(key: string) {
    debug('reading file contents %s%s%s', this.options.root, sep, key)

    return ''
  }

  /**
   * Returns the contents of the file as a stream. An
   * exception is thrown when the file is missing.
   */
  public static async getStream(key: string) {
    debug(
      'reading file contents as a stream %s%s%s',
      this.options.root,
      sep,
      key
    )

    const stream = new PassThrough()

    stream.end()

    return stream
  }

  /**
   * Writes a file to the destination with the provided contents.
   *
   * - Missing directories will be created recursively.
   * - Existing file will be overwritten.
   */
  public static async put(key: string, _: string | Buffer) {
    debug('creating/updating file %s%s%s', this.options.root, sep, key)

    return this
  }

  /**
   * Writes a file to the destination with the provided contents
   * as a readable stream.
   *
   * - Missing directories will be created recursively.
   * - Existing file will be overwritten.
   */
  public static async putStream(key: string, _: Readable) {
    debug(
      'creating/updating file using readable stream %s%s%s',
      this.options.root,
      sep,
      key
    )

    return this
  }

  /**
   * Copies the source file to the destination. Both paths must
   * be within the root location.
   */
  public static async copy(from: string, to: string) {
    debug('copying file from %s to %s', from, to)

    return this
  }

  /**
   * Moves the source file to the destination. Both paths must
   * be within the root location.
   */
  public static async move(from: string, to: string) {
    debug('moving file from %s to %s', from, to)

    return this
  }

  /**
   * Deletes a file within the root location of the filesystem.
   * Attempting to delete a non-existing file will result in
   * a noop.
   */
  public static async delete(key: string) {
    debug('deleting file %s%s%s', this.options.root, sep, key)

    return this
  }
}
