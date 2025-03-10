const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

function zipFolderWithExclusions(sourceFolder, outputZipPath, exclude = []) {
  const output = fs.createWriteStream(outputZipPath)
  const archive = archiver('zip', {
    zlib: { level: 9 } // The highest compression level
  })

  output.on('close', () => {
    console.log(`Zip file was created: ${outputZipPath}`)
    console.log(`Total size: ${archive.pointer()} bytes`)
  })

  archive.on('error', (err) => {
    throw err
  })

  archive.pipe(output)

  function addFolderToArchive(sourceFolder, folderName) {
    const items = fs.readdirSync(sourceFolder)

    items.forEach((item) => {
      const itemPath = path.join(sourceFolder, item)
      const relativePath = path.join(folderName, item)
      const itemName = path.basename(item)

      const isExcluded = exclude.some((excluded) => {
        return itemName === excluded
      })

      if (isExcluded) {
        console.log(`Excluded: ${relativePath}`)
        return
      }

      const stats = fs.lstatSync(itemPath)
      if (stats.isDirectory()) {
        addFolderToArchive(itemPath, relativePath)
      } else {
        archive.file(itemPath, { name: relativePath })
      }
    })
  }

  addFolderToArchive(sourceFolder, 'local-fonts-uploader')
  archive.finalize()
}

function getZipFilesInRootFolder() {
  const rootFolder = './' // Specify the root folder (could be adjusted)
  const files = fs.readdirSync(rootFolder)

  // Return an array of .zip files in the root folder
  return files.filter((file) => path.extname(file) === '.zip')
}

const currentDate = new Date()
const formattedDate = currentDate
    .toISOString()
    .replace(/T/, '-')
    .replace(/:/g, '')
    .substring(0, 16)

const outputFileName = 'local-fonts-uploader.zip'
//const outputFileName = `local-fonts-uploader-${formattedDate}.zip`
const sourceFolder = '../local-fonts-uploader'
const outputZipPath = `./${outputFileName}`
const exclude = [
  '.git',
  '.gitignore',
  'pack-plugin.js',
  'package.json',
  'package-lock.json',
  'node_modules',
  'webpack.config.js',
  'readme.md',
  'admin\\src',
  'src',
  'assets\\vendor\\bundle.js.LICENSE.txt',
  ...getZipFilesInRootFolder() // Exclude all .zip files dynamically
]

zipFolderWithExclusions(sourceFolder, outputZipPath, exclude)
