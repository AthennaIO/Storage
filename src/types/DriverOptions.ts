/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  FSDriverOptions,
  S3DriverOptions,
  FakeDriverOptions
} from '#src/types'

export type DriverOptions =
  | Partial<FSDriverOptions>
  | Partial<S3DriverOptions>
  | Partial<FakeDriverOptions>
