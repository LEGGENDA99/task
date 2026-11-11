const { Router } = require('express')
const fs = require('node:fs/promises')
const path = require('node:path')
const {
  uploadsDir,
  uploadAvatar,
  uploadProfile,
  uploadDocuments,
  uploadToMemory
} = require('../middleware/upload')

const router = Router()

function fileInfo(file, folder) {
  return {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url: `/uploads/${folder}/${file.filename}`
  }
}

router.post('/avatar', uploadAvatar.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' })
  }

  res.status(201).json({
    message: 'Аватар загружен',
    file: fileInfo(req.file, 'avatars')
  })
})

router.post(
  '/documents',
  uploadDocuments.array('documents', 5),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Файлы не загружены' })
    }

    res.status(201).json({
      message: `Загружено файлов: ${req.files.length}`,
      files: req.files.map(file => fileInfo(file, 'documents'))
    })
  }
)

router.post(
  '/profile',
  uploadProfile.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req, res) => {
    const { name, bio } = req.body || {}
    const avatar = req.files?.avatar?.[0]
    const cover = req.files?.cover?.[0]

    if (typeof name !== 'string' || !name.trim()) {
      await Promise.all(
        [avatar, cover]
          .filter(Boolean)
          .map(file => fs.unlink(file.path))
      )

      return res.status(400).json({ error: 'Поле name обязательно' })
    }

    res.status(201).json({
      message: 'Профиль обновлён',
      profile: {
        name: name.trim(),
        bio: typeof bio === 'string' ? bio : '',
        avatar: avatar ? `/uploads/avatars/${avatar.filename}` : null,
        cover: cover ? `/uploads/avatars/${cover.filename}` : null
      }
    })
  }
)

router.post(
  '/image/process',
  uploadToMemory.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' })
    }

    const base64 = req.file.buffer.toString('base64')

    res.json({
      message: 'Файл получен в памяти',
      size: req.file.size,
      preview: `data:${req.file.mimetype};base64,${base64}`
    })
  }
)

router.delete('/:folder/:filename', async (req, res) => {
  const { folder, filename } = req.params

  if (!['avatars', 'documents'].includes(folder)) {
    return res.status(400).json({ error: 'Недопустимая папка' })
  }

  if (
    filename !== path.basename(filename) ||
    filename.includes('\\') ||
    filename === '.' ||
    filename === '..'
  ) {
    return res.status(400).json({ error: 'Недопустимое имя файла' })
  }

  const filePath = path.join(uploadsDir, folder, filename)

  try {
    await fs.unlink(filePath)
    res.json({ message: 'Файл удалён' })
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Файл не найден' })
    }

    throw error
  }
})

module.exports = router