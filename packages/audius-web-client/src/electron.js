const {
  app,
  protocol,
  BrowserWindow,
  Menu,
  session,
  shell
} = require('electron')
const { autoUpdater } = require('electron-updater')
const logger = require('electron-log')
const ipcMain = require('electron').ipcMain
const fs = require('fs')
const url = require('url')
const path = require('path')
const util = require('util')
const stat = util.promisify(fs.stat)

// The protocol scheme determines what URLs resolve to the app.
// In this case audius:// will.
const SCHEME = 'audius'

const Environment = Object.freeze({
  PRODUCTION: 0,
  STAGING: 1,
  LOCALHOST: 2
})

const args = process.argv.slice(2)

let appEnvironment
// NOTE: This args will only apply if running electron itself locally
// Production builds with installers (staging and prod) cannot receive args like this.
if (args.length > 0) {
  switch (args[0]) {
    case 'localhost':
      appEnvironment = Environment.LOCALHOST
      break
    case 'staging':
      appEnvironment = Environment.STAGING
      break
    case 'production':
      appEnvironment = Environment.PRODUCTION
      break
    default:
      appEnvironment = ''
      break
  }
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: { standard: true, secure: true, supportFetchAPI: true }
  }
])

const getPath = async p => {
  try {
    const result = await stat(p)

    if (result.isFile()) {
      return p
    }

    return getPath(path.join(p, 'index.html'))
  } catch (err) {}
}

/**
 * Transforms a url audius://route to audius://-/route so that it is
 * properly loaded from the filesystem.
 */
const reformatURL = url => {
  if (!url) return `${SCHEME}://-`
  const path = url.replace(`${SCHEME}://`, '').replace(`${SCHEME}:`, '')
  return `${SCHEME}://-/${path}`
}

/**
 * Initializes the auto-updater. Updater flows as follows:
 *
 * A. If the app renders
 *    1. Check for updates
 *    2. Notify the app on
 *       i) There is an update available (not downloaded) 'updateAvailable'
 *      ii) We just downloaded an update 'updateDownloaded'
 *     iii) There is any progress on an udpate download 'updateDownloadProgress'
 *    3. Install update on quit
 *
 * B. If the app fails to render
 *    1. Check for updates
 *    2. Install update on quit
 */
const initAutoUpdater = () => {
  autoUpdater.checkForUpdates()
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.logger = logger
  autoUpdater.logger.transports.file.level = 'info'
}

// The main app window
let mainWindow
// Set if the app is opened up via a deep link (e.g. audius://handle in the web browser)
let deepLinkedURL
const createWindow = () => {
  const config = {
    width: 1920,
    height: 1080,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hidden',
    nativeWindowOpen: true,
    webPreferences: {
      nodeIntegration: true
    }
  }

  // Create the browser window.
  mainWindow = new BrowserWindow(config)

  // Hide win/linux menus
  mainWindow.removeMenu()

  if (appEnvironment === Environment.LOCALHOST) {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    let directory
    if (appEnvironment === Environment.STAGING) {
      directory = path.resolve(app.getAppPath(), 'build-staging')
    } else if (appEnvironment === Environment.PRODUCTION) {
      directory = path.resolve(app.getAppPath(), 'build-production')
    } else {
      // What CI will use when it creates an installer.
      directory = path.resolve(app.getAppPath(), 'build')
    }

    const handler = async (request, cb) => {
      const indexPath = path.join(directory, 'index.html')
      const filePath = path.join(directory, new url.URL(request.url).pathname)

      const cbArgs = { path: (await getPath(filePath)) || indexPath }
      cb(cbArgs)
    }

    session.defaultSession.protocol.registerFileProtocol(
      SCHEME,
      handler,
      err => {
        // The scheme has probably already been registered. Most likely safe to ignore.
        if (err) {
          console.log(err)
        }
      }
    )

    // Win protocol handler
    if (process.platform === 'win32') {
      const url = process.argv.slice(1)[0]
      deepLinkedURL = reformatURL(url)
    }

    if (deepLinkedURL) {
      mainWindow.loadURL(deepLinkedURL)
    } else {
      mainWindow.loadURL(`${SCHEME}://-`)
    }
  }

  mainWindow.on('close', e => {
    mainWindow.webContents.send('close')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on('new-window', (e, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })

  // Initialize auto updater regardless of success or failure
  mainWindow.webContents.on('did-finish-load', () => {
    initAutoUpdater()
  })
  mainWindow.webContents.on('did-fail-load', () => {
    initAutoUpdater()
  })
}

// Acquire a lock for Windows so the app only launches once.
// See https://stackoverflow.com/questions/43912119/open-app-and-pass-parameters-with-deep-linking-using-electron-macos
const lock = app.requestSingleInstanceLock()
if (!lock) {
  app.quit()
} else {
  // Win protocol handler
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (process.platform === 'win32') {
      const url = argv.slice(1)[0]
      deepLinkedURL = reformatURL(url)
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.loadURL(deepLinkedURL)
    }
  })
}

function initMenu() {
  // Create the Application's main menu
  const template = [
    {
      label: 'Application',
      submenu: [
        {
          label: 'About Application',
          selector: 'orderFrontStandardAboutPanel:'
        },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload()
        }
      ]
    }
  ]

  if (
    appEnvironment === Environment.LOCALHOST ||
    appEnvironment === Environment.STAGING
  ) {
    template.push({
      label: 'Debug',
      submenu: [
        {
          label: 'DevTools',
          accelerator: 'CmdOrCtrl+Option+I',
          click: () => mainWindow.webContents.openDevTools()
        }
      ]
    })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

/* IPC Handlers */
let canUpdate = false

ipcMain.on('update', async (event, arg) => {
  // eslint-disable-next-line
  while (!canUpdate) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  autoUpdater.quitAndInstall()
})

ipcMain.on('quit', (event, arg) => {
  app.exit(0)
})

autoUpdater.on('update-downloaded', info => {
  canUpdate = true
  info.currentVersion = autoUpdater.currentVersion.version
  if (mainWindow) mainWindow.webContents.send('updateDownloaded', info)
})

autoUpdater.on('update-available', info => {
  info.currentVersion = autoUpdater.currentVersion.version
  if (mainWindow) mainWindow.webContents.send('updateAvailable', info)
})

autoUpdater.on('download-progress', info => {
  if (mainWindow) mainWindow.webContents.send('updateDownloadProgress', info)
})

/* App Event Handlers */
app.setAsDefaultProtocolClient(SCHEME)

app.on('ready', () => {
  createWindow()
  // Do not init the menu on windows because it only gets in the way of the app.
  // We can re-enable this when we fix the close/maximize/etc buttons on windows
  // with our own Audius style. Frame:hidden on the browser window config should be used
  // then.
  if (process.platform === 'win32') {
    Menu.setApplicationMenu(null)
  } else {
    initMenu()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

// OSX protocol handler
app.on('open-url', (event, url) => {
  event.preventDefault()
  deepLinkedURL = reformatURL(url)
  // The app is already open, just redirect
  if (mainWindow) {
    mainWindow.loadURL(deepLinkedURL)
  }
})
