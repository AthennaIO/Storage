/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { EnvHelper } from '@athenna/config'
import { Storage } from '#src/facades/Storage'
import { StorageProvider } from '#src/providers/StorageProvider'
import { Test, BeforeAll, type Context, AfterEach } from '@athenna/test'

export default class S3DriverTest {
  // 1 MB of content
  private bigContent = Buffer.alloc(Math.max(0, 1024 * 1024 * 1 - 2), 'l')

  @BeforeAll()
  public async beforeAll() {
    EnvHelper.resolveFilePath(Path.pwd('.env'))
    await Config.loadAll(Path.fixtures('config'))

    new StorageProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    await Storage.disk('s3').deleteAll()
  }

  @Test()
  public async shouldBeAbleToGetAFile({ assert }: Context) {
    await Storage.disk('s3').put('file.txt', '123')

    const content = await Storage.disk('s3').get('file.txt')

    assert.deepEqual(content, '123')
  }

  @Test()
  public async shouldBeAbleToGetAFileAsStream({ assert }: Context) {
    assert.plan(1)

    await Storage.disk('s3').put('file.txt', '123')

    const stream = await Storage.disk('s3').getStream('file.txt')

    await new Promise(resolve => {
      stream.on('data', buffer => assert.deepEqual(buffer.toString(), '123')).on('end', resolve)
    })
  }

  @Test()
  public async shouldBeAbleToStoreAFile({ assert }: Context) {
    await Storage.disk('s3').put('big.txt', this.bigContent)

    assert.isTrue(await Storage.disk('s3').exists('big.txt'))
  }

  @Test()
  public async shouldBeAbleToStreamAFile({ assert }: Context) {
    await Storage.disk('s3').put('big.txt', this.bigContent)

    const stream = await Storage.disk('s3').getStream('big.txt')

    await Storage.disk('s3').putStream('big-copy.txt', stream)

    assert.isTrue(await Storage.disk('s3').exists('big.txt'))
    assert.isTrue(await Storage.disk('s3').exists('big-copy.txt'))
  }

  @Test()
  public async shouldBeAbleToVerifyThatAFileExists({ assert }: Context) {
    await Storage.disk('s3').put('big.txt', this.bigContent)

    assert.isTrue(await Storage.disk('s3').exists('big.txt'))
    assert.isFalse(await Storage.disk('s3').exists('not-found.txt'))
  }

  @Test()
  public async shouldBeAbleToCopyAFile({ assert }: Context) {
    await Storage.disk('s3').put('big.txt', this.bigContent)
    await Storage.disk('s3').copy('big.txt', 'big-copy.txt')

    assert.isTrue(await Storage.disk('s3').exists('big-copy.txt'))
  }

  @Test()
  public async shouldBeAbleToMoveAFile({ assert }: Context) {
    await Storage.disk('s3').put('big.txt', this.bigContent)
    await Storage.disk('s3').move('big.txt', 'big-move.txt')

    assert.isFalse(await Storage.disk('s3').exists('big.txt'))
    assert.isTrue(await Storage.disk('s3').exists('big-move.txt'))
  }

  @Test()
  public async shouldBeAbleToDeleteAFile({ assert }: Context) {
    await Storage.disk('s3').put('big.txt', this.bigContent)
    await Storage.disk('s3').delete('big.txt')

    assert.isFalse(await Storage.disk('s3').exists('big.txt'))
  }

  @Test()
  public async shouldBeAbleToCreateASignedPutUrl({ assert }: Context) {
    const result = await Storage.disk('s3').getSignedUrl('signed/put.txt', {
      method: 'put',
      contentType: 'text/plain'
    })

    const url = new URL(result.url)

    assert.deepEqual(result.method, 'put')
    assert.deepEqual(result.key, 'signed/put.txt')
    assert.match(url.pathname, /\/signed\/put\.txt$/)
    assert.isNotNull(url.searchParams.get('X-Amz-Signature'))
    assert.deepEqual(url.searchParams.get('X-Amz-Expires'), '300')

    /**
     * Regression: the SDK must NOT auto-inject CRC32 checksum params,
     * otherwise browser PUTs hit a CORS preflight failure.
     */
    assert.isNull(url.searchParams.get('x-amz-sdk-checksum-algorithm'))
    assert.isNull(url.searchParams.get('x-amz-checksum-crc32'))
  }

  @Test()
  public async shouldBeAbleToCreateASignedGetUrl({ assert }: Context) {
    const result = await Storage.disk('s3').getSignedUrl('signed/get.txt')

    const url = new URL(result.url)

    assert.deepEqual(result.method, 'get')
    assert.deepEqual(result.key, 'signed/get.txt')
    assert.match(url.pathname, /\/signed\/get\.txt$/)
    assert.isNotNull(url.searchParams.get('X-Amz-Signature'))
  }

  @Test()
  public async shouldHonourCustomExpiresInForSignedUrls({ assert }: Context) {
    const result = await Storage.disk('s3').getSignedUrl('signed/expiry.txt', {
      method: 'put',
      expiresIn: 60
    })

    const url = new URL(result.url)

    assert.deepEqual(url.searchParams.get('X-Amz-Expires'), '60')
    /**
     * `expiresAt` is computed from `Date.now()` so it is bound to be very
     * close to "60 seconds from now". Allow a small skew window.
     */
    const ms = new Date(result.expiresAt).getTime() - Date.now()
    assert.isAbove(ms, 55 * 1000)
    assert.isBelow(ms, 65 * 1000)
  }

  @Test()
  public async shouldForwardResponseHeadersForSignedGetUrls({ assert }: Context) {
    const result = await Storage.disk('s3').getSignedUrl('signed/download.txt', {
      contentDisposition: 'attachment; filename="report.pdf"',
      responseContentType: 'application/pdf'
    })

    const url = new URL(result.url)

    assert.deepEqual(url.searchParams.get('response-content-disposition'), 'attachment; filename="report.pdf"')
    assert.deepEqual(url.searchParams.get('response-content-type'), 'application/pdf')
  }
}
