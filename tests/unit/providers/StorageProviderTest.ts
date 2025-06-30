/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Config } from '@athenna/config'
import { Storage, StorageProvider } from '#src'
import { Test, Mock, BeforeEach, AfterEach, type Context } from '@athenna/test'

export class StorageProviderTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
    ioc.reconstruct()
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToRegisterStorageImplementationInTheContainer({ assert }: Context) {
    new StorageProvider().register()

    assert.isTrue(ioc.has('Athenna/Core/Storage'))
  }

  @Test()
  public async shouldBeAbleToUseStorageImplementationFromFacade({ assert }: Context) {
    new StorageProvider().register()

    assert.isDefined(Storage.diskName)
  }
}
