const multer = require('multer')
const path = require('node:path')
const crypto = require('node:crypto')
const fs = require('node:fs')

const uploadsDir = path.join(__dirname, '../../uploads')

for (const folder of ['avatars', 'documents']) {
  fs.mkdirSync(path.join(uploadsDir, folder), { recursive: true })
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadsDir, 'avatars'))
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    cb(null, `${crypto.randomUUID()}${extension}`)
  }
})

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadsDir, 'documents'))
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${crypto.randomUUID()}_${safeName}`)
  }
})

const imageFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true)
  }

  const error = new Error('Разрешены только изображения: JPEG, PNG, WebP, GIF')
  error.status = 400
  cb(error)
}

const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv'
  ]

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true)
  }

  const error = new Error('Разрешены только документы: PDF, DOC, DOCX, TXT, CSV')
  error.status = 400
  cb(error)
}

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1
  }
})

const uploadProfile = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 2
  }
})

const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
})

const uploadToMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
})

module.exports = {
  uploadsDir,
  uploadAvatar,
  uploadProfile,
  uploadDocuments,
  uploadToMemory
}