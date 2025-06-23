/**
 * @athenna/storage
 *
 * (c) Victor Tesoura Júnior <txsoura@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Exception, Path } from '@athenna/common'

export class NotImplementedConfigException extends Exception {
  public constructor(diskName: string) {
    const message = `Disk ${diskName} is not configured inside storage.disks object from config/storage file.`

    let help = ''

    if (Config.get('storage.disks')) {
      const availableConfigs = Object.keys(Config.get('storage.disks')).join(
        ', '
      )

      help += `Available disks are: ${availableConfigs}.`
    } else {
      help += `The "Config.get('storage.disks') is empty, maybe your configuration files are not loaded?`
    }

    help += ` Create your configuration inside disks object to use it. Or load your configuration files using "Config.safeLoad(Path.config('storage.${Path.ext()}'))`

    super({
      message,
      status: 500,
      code: 'E_NOT_IMPLEMENTED_CONFIG_ERROR',
      help
    })
  }
}
