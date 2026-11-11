# Тестирование загрузки файлов

## Установка и запуск

```bash
npm install
npm start
```

Сервер: http://localhost:3000.

Команды проверки выполняются в отдельном терминале из папки проекта.

## Подготовка файлов

```bash
echo "fake image content" > test.jpg
echo "test" > test.txt
```

Файл test.jpg содержит текст, как в исходном задании. Проверяется MIME-тип, переданный клиентом, а не содержимое файла. Для проверки настоящих изображений можно использовать собственный JPG.

## Загрузка аватара

```bash
curl -i http://localhost:3000/upload/avatar \
  -F "avatar=@test.jpg;type=image/jpeg"
```

Ожидаемый статус: 201.

Ответ содержит сообщение «Аватар загружен», имя, размер, MIME-тип и URL файла.

Для получения файла нужно открыть http://localhost:3000 и добавить путь из file.url.

## Неправильный тип файла

```bash
curl -i http://localhost:3000/upload/avatar \
  -F "avatar=@test.txt;type=text/plain"
```

Ожидаемый статус: 400.

```json
{
  "error": "Разрешены только изображения: JPEG, PNG, WebP, GIF"
}
```

## Загрузка нескольких документов

```bash
curl -i http://localhost:3000/upload/documents \
  -F "documents=@test.txt;type=text/plain" \
  -F "documents=@test.txt;type=text/plain"
```

Ожидаемый статус: 201.

Ответ содержит сообщение «Загружено файлов: 2» и массив files.
Сохранённые файлы имеют разные имена.

## Загрузка профиля

```bash
curl -i http://localhost:3000/upload/profile \
  -F "name=Alice" \
  -F "bio=Backend developer" \
  -F "avatar=@test.jpg;type=image/jpeg"
```

Ожидаемый статус: 201.

Ответ содержит имя Alice, описание Backend developer и ссылку на аватар.

## Загрузка профиля с обложкой

```bash
curl -i http://localhost:3000/upload/profile \
  -F "name=Alice" \
  -F "bio=Backend developer" \
  -F "avatar=@test.jpg;type=image/jpeg" \
  -F "cover=@test.jpg;type=image/jpeg"
```

Ожидаемый статус: 201.

Ответ содержит ссылки на avatar и cover.

## Отсутствующее имя профиля

```bash
curl -i http://localhost:3000/upload/profile \
  -F "avatar=@test.jpg;type=image/jpeg"
```

Ожидаемый статус: 400.

```json
{
  "error": "Поле name обязательно"
}
```

## Загрузка в память

```bash
curl -i http://localhost:3000/upload/image/process \
  -F "image=@test.jpg;type=image/jpeg"
```

Ожидаемый статус: 200.

Ответ содержит размер файла и preview в формате data URL.
Файл не сохраняется на диск.

## Отсутствующий файл

```bash
curl -i -X POST http://localhost:3000/upload/avatar
```

Ожидаемый статус: 400.

```json
{
  "error": "Файл не загружен"
}
```

## Неправильное имя поля

```bash
curl -i http://localhost:3000/upload/avatar \
  -F "photo=@test.jpg;type=image/jpeg"
```

Ожидаемый статус: 400.

```json
{
  "error": "Неожиданное поле файла"
}
```

## Превышение количества документов

```bash
curl -i http://localhost:3000/upload/documents \
  -F "documents=@test.txt" \
  -F "documents=@test.txt" \
  -F "documents=@test.txt" \
  -F "documents=@test.txt" \
  -F "documents=@test.txt" \
  -F "documents=@test.txt"
```

Ожидаемый статус: 400.

```json
{
  "error": "Превышено максимальное количество файлов"
}
```

## Удаление файла

Заменить ИМЯ_ФАЙЛА на filename из ответа загрузки аватара.

```bash
curl -i -X DELETE \
  http://localhost:3000/upload/avatars/ИМЯ_ФАЙЛА
```

Ожидаемый статус: 200.

```json
{
  "message": "Файл удалён"
}
```

Повторный запрос возвращает статус 404.

```json
{
  "error": "Файл не найден"
}
```