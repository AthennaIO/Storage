/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { FSDriver } from '#src/storage/drivers/FSDriver'
import { S3Driver } from '#src/storage/drivers/S3Driver'
import { NotFoundDriverException } from '#src/exceptions/NotFoundDriverException'
import { NotImplementedConfigException } from '#src/exceptions/NotImplementedConfigException'

export class DriverFactory {
  /**
   * Driver of driver factory.
   */
  public static drivers: Map<string, { Driver: any }> = new Map()
    .set('fs', { Driver: FSDriver })
    .set('s3', { Driver: S3Driver })

  /**
   * Return an array of all available drivers.
   */
  public static availableDrivers(): string[] {
    return [...this.drivers.keys()]
  }

  /**
   * Fabricate a new instance of a driver based in disk configurations.
   */
  public static fabricate(diskName: string, runtimeConfig: any = {}) {
    const diskConfig = this.getDiskConfig(diskName)

    const { Driver } = this.drivers.get(diskConfig.driver)

    return new Driver({ ...diskConfig, ...runtimeConfig })
  }

  /**
   * Get all disk configuration.
   */
  private static getDiskConfig(diskName: string): any {
    if (diskName === 'default') {
      diskName = Config.get('storage.default')
    }

    const diskConfig = Config.get(`storage.disks.${diskName}`)

    if (!diskConfig) {
      throw new NotImplementedConfigException(diskName)
    }

    if (!this.drivers.has(diskConfig.driver)) {
      throw new NotFoundDriverException(diskConfig.driver)
    }

    return diskConfig
  }
}
