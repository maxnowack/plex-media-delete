require('dotenv').config()
require('console-stamp')(console)
const PlexApi = require('plex-api')
const fs = require('fs')
const cron = require('node-cron')

const plexHost = process.env.PLEX_HOST
if (!plexHost) throw new Error('PLEX_HOST is not set')

const playlistId = process.env.PLEX_PLAYLIST_ID
if (!playlistId) throw new Error('PLEX_PLAYLIST_ID is not set')

const plexToken = process.env.PLEX_TOKEN
if (!plexToken) throw new Error('PLEX_TOKEN is not set')

const plexClient = new PlexApi({ hostname: plexHost, token: plexToken })

async function deleteItems() {
  const playlist = await plexClient.query(`/playlists/${playlistId}/items`)
  const items = playlist.MediaContainer.Metadata
  const files = items.reduce((fls, item) => {
    item.Media.forEach((media) => {
      media.Part.forEach(({ file }) => {
        fls.push(file)
      })
    })
    return fls
  }, [])
  console.log(`Deleting ${files.length} files`)
  await Promise.all(files.map(async (file) => {
    await fs.promises.unlink(file)
    console.log(`Deleted ${file}`)
  }))
}

// every hour
cron.schedule('0 * * * *', () => {
  deleteItems()
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
})

deleteItems()
  .catch((err) => {
    console.error(err)
  })
