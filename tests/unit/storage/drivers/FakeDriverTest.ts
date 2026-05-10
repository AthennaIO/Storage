/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { FakeDriver } from '#src/storage/drivers/FakeDriver'
import { Test, type Context } from '@athenna/test'

export default class FakeDriverTest {
  @Test()
  public async shouldReturnADeterministicSignedGetUrl({ assert }: Context) {
    const result = await FakeDriver.getSignedUrl('avatar.png')

    assert.deepEqual(result.method, 'get')
    assert.deepEqual(result.key, 'avatar.png')
    assert.deepEqual(result.url, 'https://fake.storage/get/avatar.png?expires=300')
    assert.isString(result.expiresAt)
  }

  @Test()
  public async shouldReturnADeterministicSignedPutUrlWithCustomExpiry({ assert }: Context) {
    const result = await FakeDriver.getSignedUrl('avatar.png', {
      method: 'put',
      expiresIn: 60
    })

    assert.deepEqual(result.method, 'put')
    assert.deepEqual(result.url, 'https://fake.storage/put/avatar.png?expires=60')
  }
}
