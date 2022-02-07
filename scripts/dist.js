/**
 * Builds distributable desktop applications.
 * Mac:
 *  - Must be run on OSX.
 *  - Codesigns and notarizes the binary
 */

const fs = require('fs')
const path = require('path')

const program = require('commander')
const builder = require('electron-builder')
const notarize = require('electron-notarize').notarize
const fse = require('fs-extra')

const PRODUCTION_APP_ID = 'co.audius.app'
const PRODUCTION_NAME = 'Audius'
const PRODUCTION_PACKAGE_JSON_NAME = 'audius-client'
const PRODUCTION_BUCKET = 'download.audius.co'
const PRODUCTION_ICNS = 'resources/icons/AudiusIcon.icns'
const PRODUCTION_DMG_ICNS = 'resources/icons/AudiusDmgIcon.icns'
const PRODUCTION_ICON = 'resources/icons/AudiusIcon.png'
const PRODUCTION_SCHEME = 'audius'
const PRODUCTION_BUILD_DIR = 'build-production'

const STAGING_APP_ID = 'co.audius.staging.app'
const STAGING_NAME = 'Audius Staging'
const STAGING_PACKAGE_JSON_NAME = 'audius-client-staging'
const STAGING_BUCKET = 'download.staging.audius.co'
const STAGING_ICNS = 'resources/icons/AudiusStagingIcon.icns'
const STAGING_DMG_ICNS = 'resources/icons/AudiusStagingDmgIcon.icns'
const STAGING_ICON = 'resources/icons/AudiusStagingIcon.png'
const STAGING_SCHEME = 'audius-staging'
const STAGING_BUILD_DIR = 'build-staging'

program
  .option('-m, --mac', 'Build for mac')
  .option('-w, --win', 'Build for windows')
  .option('-l, --linux', 'Build for linux')
  .option('-p, --publish [rule]', 'Add publish rule', '')
  .option(
    '-e, --env [mode]',
    'Selected environment to deploy',
    /^(staging|production)$/i
  )
  .parse(process.argv)

const notarizeFn = async (appId, params) => {
  // Only notarize the app on Mac OS.
  if (process.platform !== 'darwin') {
    return
  }
  const appPath = path.join(
    params.appOutDir,
    `${params.packager.appInfo.productFilename}.app`
  )
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`)
  }

  console.log(`Notarizing ${appId} at ${appPath}`)
  try {
    await notarize({
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      ascProvider: process.env.ASC_PROVIDER
    })
  } catch (error) {
    console.error(error)
    // Propagate the error back up.
    throw new Error(error)
  }
  console.log(`Finished notarizing ${appId}`)
}

/**
 * Write a json file indicating what environment the application is running in
 * @param {boolean} isProduction
 */
const writeEnv = isProduction => {
  if (isProduction) {
    return fse.writeFile(
      'electronConfig.json',
      JSON.stringify({ env: 'production' })
    )
  }
  return fse.writeFile(
    'electronConfig.json',
    JSON.stringify({ env: 'staging' })
  )
}

/**
 * Generates the correct application info/build config based on the environment
 * @param {boolean} isProduction
 */
const makeBuildParams = isProduction => {
  const appId = isProduction ? PRODUCTION_APP_ID : STAGING_APP_ID
  const productName = isProduction ? PRODUCTION_NAME : STAGING_NAME
  const packageJsonName = isProduction
    ? PRODUCTION_PACKAGE_JSON_NAME
    : STAGING_PACKAGE_JSON_NAME

  const bucket = isProduction ? PRODUCTION_BUCKET : STAGING_BUCKET
  const icns = isProduction ? PRODUCTION_ICNS : STAGING_ICNS
  const dmgIcns = isProduction ? PRODUCTION_DMG_ICNS : STAGING_DMG_ICNS
  const icon = isProduction ? PRODUCTION_ICON : STAGING_ICON
  const buildDir = isProduction ? PRODUCTION_BUILD_DIR : STAGING_BUILD_DIR

  const scheme = isProduction ? PRODUCTION_SCHEME : STAGING_SCHEME

  return {
    config: {
      appId: appId,
      npmRebuild: false,
      productName: productName,
      // Inject data into package.json
      // https://www.electron.build/configuration/configuration
      extraMetadata: {
        // We set prod & stage to separate values to ensure that
        // the app's app-data does not collide (in addition to a different `scheme`).
        // `productName` controls the app-data location on most platforms.
        // https://github.com/electron-userland/electron-builder/issues/3429#issuecomment-434024379
        productName: productName,
        // `name` controls the app-data location on some linux platforms.
        // https://github.com/electron/electron/blob/main/docs/api/app.md#appgetname
        name: packageJsonName
      },
      extends: null,
      directories: {
        buildResources: buildDir
      },
      files: [`${buildDir}/**/*`, 'electronConfig.json', 'src/electron.js'],
      protocols: {
        // Scheme controls deep links as well as local-storage prefix
        name: scheme,
        schemes: [scheme]
      },
      mac: {
        category: 'public.app-category.music',
        icon: icns,
        hardenedRuntime: true,
        entitlements: 'resources/entitlements.mac.plist',
        entitlementsInherit: 'resources/entitlements.mac.plist'
      },
      dmg: {
        icon: dmgIcns,
        background: 'resources/macInstaller@2x.jpg',
        iconSize: 100,
        iconTextSize: 14,
        window: {
          height: 400,
          width: 600
        },
        contents: [
          {
            x: 94,
            y: 198,
            type: 'file'
          },
          {
            x: 492,
            y: 198,
            type: 'link',
            path: '/Applications'
          }
        ]
      },
      win: {
        target: 'nsis',
        icon: icon,
        publisherName: 'Audius, Inc.'
      },
      linux: {
        target: 'AppImage',
        icon: icns,
        category: 'Audio'
      },
      // Do not publish to snap store, which is enabled by default.
      // See:
      // https://github.com/electron-userland/electron-builder/issues/3187#issuecomment-709100071
      snap: {
        publish: {
          provider: 'generic',
          url: 'https://audius.co'
        }
      },
      afterSign: async params => notarizeFn(appId, params),
      publish: {
        provider: 's3',
        bucket,
        region: 'us-west-1'
      }
    }
  }
}

const buildParams = makeBuildParams(program.env === 'production')

if (program.mac) {
  buildParams.mac = ['default']
}
if (program.win) {
  buildParams.win = ['default']
}
if (program.linux) {
  buildParams.linux = ['default']
}

if (program.publish) {
  buildParams.publish = program.publish
}

console.log('Creating distribution with the following build params:')
console.log(buildParams)

writeEnv(program.env === 'production').then(() => {
  builder.build(buildParams).catch(e => {
    console.error(e)
    process.exit(1)
  })
})
