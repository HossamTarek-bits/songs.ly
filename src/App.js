import { useState, useMemo } from 'react'
import { FilesViewer } from './FilesViewer'
import Button from 'react-bootstrap/Button'
const fs = window.require('fs')
const pathModule = window.require('path')

const { app } = window.require('@electron/remote')

const formatSize = size => {
  var i = Math.floor(Math.log(size) / Math.log(1024))
  return (
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
    ' ' +
    ['B', 'kB', 'MB', 'GB', 'TB'][i]
  )
}

function App() {
  const [path, setPath] = useState(app.getAppPath())

  const files = useMemo(
    () =>
      fs
        .readdirSync(path)
        .map(file => {
          const stats = fs.statSync(pathModule.join(path, file))
          return {
            name: file,
            size: stats.isFile() ? formatSize(stats.size ?? 0) : null,
            directory: stats.isDirectory()
          }
        })
        .sort((a, b) => {
          if (a.directory === b.directory) {
            return a.name.localeCompare(b.name)
          }
          return a.directory ? -1 : 1
        }),
    [path]
  )

  const onBack = () => setPath(pathModule.dirname(path))
  const onOpen = folder => setPath(pathModule.join(path, folder))

  const [searchString, setSearchString] = useState('')
  const filteredFiles = files.filter(s => s.name.startsWith(searchString))

  return (
    <div className="container mt-2">
      <h4>{path}</h4>
      <div className="form-group mt-4 mb-2">
        <Button
          onClick={() =>
            fetch('https://api.spotify.com/v1/me/player/currently-playing', {
              method: 'GET',
              headers: {
                Authorization:
                  'Bearer BQDmFL09JNQyNAs2ir6E4T1zdzcswYUNJmLEj1x-tRBMLw4Z9joiQQ04s3kTmZKtJ7BQp4G2JUBzfLBNVbNKHc7UKSmIF0Gvl23CXfY6_r7R0tWQzYj05j1_Zl59pvKf08RpBE2Lst_RRsVdQEzg1DIWzJ6MSbacAvciVCf3Wj4x',
                'Content-Type': 'application/json'
              }
            }).then(resp => {
              resp.json().then(value => console.log(value))
            })
          }
        ></Button>
      </div>
      <FilesViewer files={filteredFiles} onBack={onBack} onOpen={onOpen} />
    </div>
  )
}

export default App
