/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'
import { StorageImpl } from '#src/storage/StorageImpl'

export class StorageProvider extends ServiceProvider {
  public register() {
    this.container.bind('Athenna/Core/Storage', new StorageImpl())
  }
}
