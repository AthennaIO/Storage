/**
 * @athenna/storage
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotImplementedDriverMethodException extends Exception {
  public constructor(driverName: string, methodName: string) {
    super({
      status: 500,
      code: 'E_NOT_IMPLEMENTED_DRIVER_METHOD_ERROR',
      message: `The "${driverName}" driver does not implement the "${methodName}" method.`,
      help: `Switch to a driver that supports "${methodName}" or override the method by creating your own driver and registering it through DriverFactory.createDriver().`
    })
  }
}
