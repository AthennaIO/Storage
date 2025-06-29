/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Path } from '@athenna/common'
import { BaseConfigurer } from '@athenna/artisan'

export default class StorageConfigurer extends BaseConfigurer {
  public async configure() {
    await this.logger
      .task()
      .addPromise(`Create storage.${Path.ext()} config file`, () => {
        return new File('./storage').copy(Path.config(`storage.${Path.ext()}`))
      })
      .addPromise('Update providers of .athennarc.json', () => {
        return this.rc
          .pushTo('providers', '@athenna/storage/providers/StorageProvider')
          .save()
      })
      .addPromise('Update .env, .env.test and .env.example', () => {
        const envs =
          '\nSTORAGE_DISK=fs\n' +
          'AWS_REGION=us-east-1\n' +
          'AWS_S3_BUCKET_NAME=athenna-storage\n' +
          'AWS_ACCESS_KEY_ID=\n' +
          'AWS_SECRET_ACCESS_KEY=\n'

        return new File(Path.pwd('.env'), '')
          .append(envs)
          .then(() => new File(Path.pwd('.env.test'), '').append(envs))
          .then(() => new File(Path.pwd('.env.example'), '').append(envs))
      })
      .run()
  }
}
