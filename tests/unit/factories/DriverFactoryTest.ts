/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DriverFactory } from '#src'
import { Path } from '@athenna/common'
import type { Context } from '@athenna/test/types'
import { AfterEach, BeforeEach, Test } from '@athenna/test'
import { NotFoundDriverException } from '#src/exceptions/NotFoundDriverException'
import { NotImplementedConfigException } from '#src/exceptions/NotImplementedConfigException'

export default class DriverFactoryTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
  }

  @Test()
  public shouldBeAbleToGetTheAvailableDriversOfDriverFactory({ assert }: Context) {
    const drivers = DriverFactory.availableDrivers()

    assert.deepEqual(drivers, ['fake', 'fs', 's3'])
  }

  @Test()
  public shouldThrowANotImplementedConfigException({ assert }: Context) {
    assert.throws(() => DriverFactory.fabricate('notImplemented'), NotImplementedConfigException)
  }

  @Test()
  public shouldThrowANotImplementedConfigExceptionWithDifferentHelpMessage({ assert }: Context) {
    Config.delete('storage')

    assert.throws(() => DriverFactory.fabricate('notImplemented'), NotImplementedConfigException)
  }

  @Test()
  public shouldThrowANotFoundDriverException({ assert }: Context) {
    assert.throws(() => DriverFactory.fabricate('nullDriver'), NotFoundDriverException)
  }
}
