/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  SignedUrlOptions,
  SignedUrlResult
} from '#src/types/SignedUrlOptions'

import { sep } from 'node:path'
import { debug } from '#src/debug'
import { File, Folder } from '@athenna/common'
import type { Readable } from 'node:stream'
import { Driver } from '#src/storage/drivers/Driver'
import type { FSDriverOptions } from '#src/types/FSDriverOptions'
import { NotImplementedDriverMethodException } from '#src/exceptions/NotImplementedDriverMethodException'

export class FSDriver extends Driver {
  /**
   * Driver options defined by user configurations.
   */
  private options: FSDriverOptions

  public constructor(options: FSDriverOptions) {
    super()
    this.options = options
  }

  /**
   * Returns a boolean indicating if the file exists or not.
   */
  public async exists(key: string) {
    debug('checking if file exists %s%s%s', this.options.root, sep, key)

    return File.exists(`${this.options.root}${sep}${key}`)
  }

  /**
   * Returns the contents of the file as a UTF-8 string. An
   * exception is thrown when the file is missing.
   */
  public async get(key: string) {
    debug('reading file contents %s%s%s', this.options.root, sep, key)

    return new File(`${this.options.root}${sep}${key}`).getContentAsString()
  }

  /**
   * Returns the contents of the file as a stream. An
   * exception is thrown when the file is missing.
   */
  public async getStream(key: string) {
    debug(
      'reading file contents as a stream %s%s%s',
      this.options.root,
      sep,
      key
    )

    return new File(`${this.options.root}${sep}${key}`).createReadStream()
  }

  /**
   * Writes a file to the destination with the provided contents.
   *
   * - Missing directories will be created recursively.
   * - Existing file will be overwritten.
   */
  public async put(key: string, content: string | Buffer) {
    debug('creating/updating file %s%s%s', this.options.root, sep, key)

    await new File(`${this.options.root}${sep}${key}`, content).load()

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
      this.options.root,
      sep,
      key
    )

    await new Promise((resolve, reject) => {
      const path = `${this.options.root}${sep}${key}`
      const stream = new File(path, '').createWriteStream()

      content
        .pipe(stream)
        .on('error', err => reject(err))
        .on('finish', () => resolve(this))
    })

    return this
  }

  /**
   * Copies the source file to the destination. Both paths must
   * be within the root location.
   */
  public async copy(from: string, to: string) {
    debug('copying file from %s to %s', from, to)

    await new File(`${this.options.root}${sep}${from}`).copy(
      `${this.options.root}${sep}${to}`
    )

    return this
  }

  /**
   * Moves the source file to the destination. Both paths must
   * be within the root location.
   */
  public async move(from: string, to: string) {
    debug('moving file from %s to %s', from, to)

    await new File(`${this.options.root}${sep}${from}`).move(
      `${this.options.root}${sep}${to}`
    )

    return this
  }

  /**
   * Deletes a file within the root location of the filesystem.
   * Attempting to delete a non-existing file will result in
   * a noop.
   */
  public async delete(key: string) {
    debug('deleting file %s%s%s', this.options.root, sep, key)

    await File.safeRemove(`${this.options.root}${sep}${key}`)

    return this
  }

  /**
   * Deletes the files and directories matching the provided
   * prefix.
   */
  public async deleteAll(prefix?: string) {
    debug(
      'deleting all files matching prefix %s%s%s',
      this.options.root,
      sep,
      prefix
    )

    if (!prefix) {
      await Folder.safeRemove(this.options.root)

      /**
       * Recreate the folder but empty.
       */
      await new Folder(this.options.root).load()

      return this
    }

    await Folder.safeRemove(`${this.options.root}${sep}${prefix}`)

    return this
  }

  /**
   * The local filesystem has no native concept of a signed URL, so the
   * driver throws an explicit error rather than fabricate one. Callers
   * that need signed access for local files should use a different
   * driver or implement a custom one.
   */
  public async getSignedUrl(
    _key: string,
    _options?: SignedUrlOptions
  ): Promise<SignedUrlResult> {
    throw new NotImplementedDriverMethodException('fs', 'getSignedUrl')
  }
}
