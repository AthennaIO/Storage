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
import { NotImplementedDriverMethodException } from '#src/exceptions/NotImplementedDriverMethodException'

export default class FSDriverTest {
  // 200 MB of content
  private bigContent = Buffer.alloc(Math.max(0, 1024 * 1024 * 200 - 2), 'l')

  @BeforeAll()
  public async beforeAll() {
    await Config.loadAll(Path.fixtures('config'))

    new StorageProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    await Folder.safeRemove(Path.storage('fs'))
  }

  @Test()
  public async shouldBeAbleToGetAFile({ assert }: Context) {
    await Storage.disk('fs').put('file.txt', '123')

    const content = await Storage.disk('fs').get('file.txt')

    assert.deepEqual(content, '123')
  }

  @Test()
  public async shouldBeAbleToGetAFileAsStream({ assert }: Context) {
    assert.plan(1)

    await Storage.disk('fs').put('file.txt', '123')

    const stream = await Storage.disk('fs').getStream('file.txt')

    await new Promise(resolve => {
      stream.on('data', buffer => assert.deepEqual(buffer.toString(), '123')).on('end', resolve)
    })
  }

  @Test()
  public async shouldBeAbleToStoreAFile({ assert }: Context) {
    await Storage.disk('fs').put('big.txt', this.bigContent)

    assert.isTrue(File.existsSync(Path.storage('fs/big.txt')))
  }

  @Test()
  public async shouldBeAbleToStreamAFile({ assert }: Context) {
    await Storage.disk('fs').put('big.txt', this.bigContent)

    const stream = await Storage.disk('fs').getStream('big.txt')

    await Storage.disk('fs').putStream('big-copy.txt', stream)

    assert.isTrue(File.existsSync(Path.storage('fs/big.txt')))
  }

  @Test()
  public async shouldBeAbleToVerifyThatAFileExists({ assert }: Context) {
    await Storage.disk('fs').put('big.txt', this.bigContent)

    assert.isTrue(await Storage.exists('big.txt'))
    assert.isFalse(await Storage.exists('not-found.txt'))
  }

  @Test()
  public async shouldBeAbleToCopyAFile({ assert }: Context) {
    await Storage.disk('fs').put('big.txt', this.bigContent)
    await Storage.disk('fs').copy('big.txt', 'big-copy.txt')

    assert.isTrue(await Storage.exists('big-copy.txt'))
  }

  @Test()
  public async shouldBeAbleToMoveAFile({ assert }: Context) {
    await Storage.disk('fs').put('big.txt', this.bigContent)
    await Storage.disk('fs').move('big.txt', 'big-move.txt')

    assert.isFalse(await Storage.exists('big.txt'))
    assert.isTrue(await Storage.exists('big-move.txt'))
  }

  @Test()
  public async shouldBeAbleToDeleteAFile({ assert }: Context) {
    await Storage.disk('fs').put('big.txt', this.bigContent)
    await Storage.disk('fs').delete('big.txt')

    assert.isFalse(await Storage.exists('big.txt'))
  }

  @Test()
  public async shouldThrowANotImplementedDriverMethodExceptionWhenCreatingASignedUrl({ assert }: Context) {
    await assert.rejects(() => Storage.disk('fs').getSignedUrl('any.txt'), NotImplementedDriverMethodException)
  }
}
