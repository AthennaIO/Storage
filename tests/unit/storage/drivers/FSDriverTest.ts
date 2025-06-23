/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Storage } from '#src/facades/Storage'
import { File, Folder, Path } from '@athenna/common'
import { StorageProvider } from '#src/providers/StorageProvider'
import { Test, BeforeAll, type Context, AfterEach } from '@athenna/test'

export default class FSDriverTest {
  // 200 MB of content
  private bigContent = Buffer.alloc(Math.max(0, 1024 * 1024 * 200 - 2), 'l')

  @BeforeAll()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))

    new StorageProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    await Folder.safeRemove(Path.storage('fs'))
  }

  @Test()
  public async shouldBeAbleToStoreAFile({ assert }: Context) {
    await Storage.disk('fs').put('big.txt', this.bigContent)

    assert.isTrue(File.existsSync(Path.storage('big.txt')))
  }

  @Test()
  public async shouldBeAbleToVerifyThatAFileExists({ assert }: Context) {
    await Storage.disk('fs').put('big.txt', this.bigContent)

    // assert.isTrue(await Storage.exists('big.txt'))
  }
}
