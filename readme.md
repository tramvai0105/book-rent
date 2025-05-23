# Быстрый старт

## Настройка окружения

Создайте файл `.env` в корне вашего проекта и добавьте следующие переменные окружения:

```env
VITE_AUTH_SECRET="" # Не реализуется
VITE_AUTH_GOOGLE_ID="" # Не реализуется
VITE_AUTH_GOOGLE_SECRET="" # Не реализуется
VITE_MAILGUN_API="f90135ac8d20363d7d36b907d4f646c0-f6202374-478f08b1" # На локалке можно использовать Google через двухфакторку (см. файл api/mail.js)
VITE_MAILGUN_DOMAIN="24dctservice.ru"
VITE_DB_HOST="localhost"
VITE_DB_USER="root"
VITE_DB_PASSWORD="1234" # Меняем на свой
VITE_YANDEX_API_KEY="3cbc2f21-5810-4da9-b7c9-1ec9a59f36b7" # [Yandex Maps API](https://yandex.ru/maps-api/docs/suggest-api/quickstart.html)
VITE_ADMIN_PASSWORD="admin"
```

## Установка и запуск

1. Установите Node.js и MySQL.
2. В MySQL создайте две базы данных: `books` и `sessions`.
Для создания баз данных MySQL на Windows, вам нужно сначала установить MySQL и затем использовать командную строку или графический интерфейс, такой как MySQL Workbench. Вот пошаговая инструкция по созданию баз данных через командную строку:

### Установка MySQL

1. **Скачайте и установите MySQL**: Перейдите на [официальный сайт MySQL](https://dev.mysql.com/downloads/mysql/) и скачайте установщик для Windows. Следуйте инструкциям по установке.

2. **Запустите MySQL сервер**: После установки убедитесь, что MySQL сервер запущен. Обычно он запускается автоматически, но вы можете проверить это через `Services` в Windows.

### Подключение к MySQL через командную строку

1. **Откройте командную строку**: Нажмите `Win + R`, введите `cmd` и нажмите `Enter`.

2. **Запустите MySQL клиент**: Введите следующую команду, чтобы подключиться к MySQL. Замените `root` на ваше имя пользователя, если вы используете другое имя, и введите свой пароль, когда будет предложено:

   ```bash
   mysql -u root -p
   ```

3. **Создайте базы данных**: После успешного подключения к MySQL, вы можете создать необходимые базы данных с помощью следующих команд:

   ```sql
   CREATE DATABASE books;
   CREATE DATABASE sessions;
   ```

4. **Проверьте созданные базы данных**: Чтобы убедиться, что базы данных были созданы, выполните команду:

   ```sql
   SHOW DATABASES;
   ```

   Вы должны увидеть `books` и `sessions` в списке баз данных.

5. **Выход из MySQL**: Чтобы выйти из MySQL, введите:

   ```sql
   EXIT;
   ```

3. Клонируйте репозиторий:

   ```bash
   git clone <URL_репозитория>
   ```

4. Установите зависимости:

   ```bash
   npm install
   npm install forever -g
   npm install cross-env -g
   ```

5. Запустите проект в режиме разработки:

   ```bash
   npm run dev
   ```

### Для продакшена

1. Соберите проект:

   ```bash
   npm run build
   ```

2. Запустите предварительный просмотр:

   ```bash
   npm run preview
   ```

   Или запустите через PM2:

   ```bash
   npm run serverProd
   ```

## О стеке

- **Среда**: Vite
- **Сервер**: Express
- **Фреймворк**: React (SSR)
- **Работа с файлами**: Multer
- **База данных**: MySQL
- **Авторизация**: Passport
- **Работа с почтой**: Nodemailer
- **Чат**: Socket.io
- **Стейтменеджер**: MobX, mobx-react-lite
- **Стили**: Tailwind, clsx

## Примечание

Для получения ключа API для Yandex GeoSuggest, посетите [Yandex Developer](https://developer.tech.yandex.ru/). Ключ будет активирован в течение 15 минут после получения.

### Пример запроса

Отправьте запрос для получения подсказок:

```http
https://suggest-maps.yandex.ru/v1/suggest?apikey=YOUR_API_KEY&text=бурдж
```

Теперь вы готовы начать работу с проектом!