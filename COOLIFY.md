# Coolify deploy

Проект рассчитан на один Docker-контейнер без внешней базы.

## Domains

```text
https://panel.strike-expo.ru
```

## Environment variables

```text
PORT=3000
PUBLIC_BASE_URL=https://panel.strike-expo.ru
ADMIN_PATH=/control-change-this-secret-path
ADMIN_PASSWORD=change-this-password
SESSION_SECRET=change-this-long-random-secret
DATA_DIR=/app/data
```

`ADMIN_PATH` не должен быть `/admin`. Это скрытый адрес входа в редактор.

## Persistent storage

Подключить volume:

```text
/app/data
```

Внутри него будут:

```text
/app/data/content.json
/app/data/uploads/
```

Если `/app/data/content.json` отсутствует, сервер создаст его из `content.seed.json`.

## Build

Use Dockerfile. Приложение слушает `PORT`.
