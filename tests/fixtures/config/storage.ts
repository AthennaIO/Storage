import { Env } from '@athenna/config'
import { Path } from '@athenna/common'

export default {
  /*
  |--------------------------------------------------------------------------
  | Default Storage Disk
  |--------------------------------------------------------------------------
  |
  | Here you may specify the default storage disk that should be used
  | by the framework. The "fs" disk, as well as a variety of cloud
  | based disks are available to your application.
  |
  */

  default: Env('STORAGE_DISK', 'fs'),

  /*
  |--------------------------------------------------------------------------
  | Storage Disks
  |--------------------------------------------------------------------------
  |
  | Here you may configure as many storage "disks" as you wish, and you
  | may even configure multiple disks of the same driver. Defaults have
  | been setup for each driver as an example of the required options.
  |
  */

  disks: {
    fs: {
      driver: 'fs',
      root: Path.storage('fs')
    },
    s3: {
      driver: 's3',
      key: Env('AWS_KEY', ''),
      secret: Env('AWS_SECRET', ''),
      region: Env('AWS_REGION', ''),
      bucket: Env('AWS_BUCKET', ''),
      endpoint: Env('AWS_ENDPOINT', '')
    }
  }
}
