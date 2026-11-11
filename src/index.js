const express = require('express')
const multer = require('multer')
const filesRouter = require('./routes/files')
const { uploadsDir } = require('./middleware/upload')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.use('/uploads', express.static(uploadsDir))
app.use('/upload', filesRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' })
})

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'Файл слишком большой',
      LIMIT_FILE_COUNT: 'Превышено максимальное количество файлов',
      LIMIT_UNEXPECTED_FILE: 'Неожиданное поле файла',
      LIMIT_FIELD_COUNT: 'Слишком много текстовых полей',
      LIMIT_FIELD_VALUE: 'Значение текстового поля слишком большое',
      LIMIT_FIELD_KEY: 'Имя поля слишком длинное',
      LIMIT_PART_COUNT: 'Слишком много частей запроса'
    }

    return res.status(400).json({
      error: messages[err.code] || 'Ошибка загрузки файла'
    })
  }

  if (err.status === 400) {
    return res.status(400).json({ error: err.message })
  }

  console.error(err)
  res.status(500).json({ error: 'Внутренняя ошибка сервера' })
})

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`)
})