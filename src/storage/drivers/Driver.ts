/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Macroable } from '@athenna/common'
import type { Readable } from 'node:stream'

export abstract class Driver extends Macroable {
  /**
   * Returns a boolean indicating if the file exists or not.
   */
  public abstract exists(key: string): Promise<boolean>

  /**
   * Returns the contents of the file as a UTF-8 string. An
   * exception is thrown when the file is missing.
   */
  public abstract get(key: string): Promise<string>

  /**
   * Returns the contents of the file as a stream. An
   * exception is thrown when the file is missing.
   */
  public abstract getStream(key: string): Promise<Readable>

  /**
   * Writes a file to the destination with the provided contents.
   *
   * - Missing directories will be created recursively.
   * - Existing file will be overwritten.
   */
  public abstract put(key: string, content: string | Buffer): Promise<this>

  /**
   * Writes a file to the destination with the provided contents
   * as a readable stream.
   *
   * - Missing directories will be created recursively.
   * - Existing file will be overwritten.
   */
  public abstract putStream(key: string, content: Readable): Promise<this>

  /**
   * Copies the source file to the destination. Both paths must
   * be within the root location.
   */
  public abstract copy(from: string, to: string): Promise<this>

  /**
   * Moves the source file to the destination. Both paths must
   * be within the root location.
   */
  public abstract move(from: string, to: string): Promise<this>

  /**
   * Deletes a file within the root location of the filesystem.
   * Attempting to delete a non-existing file will result in
   * a noop.
   */
  public abstract delete(key: string): Promise<this>
}
