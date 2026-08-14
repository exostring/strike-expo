# Strike Expo handoff

Короткий контекст для следующего агента. Прочитай это перед правками, чтобы не тратить время на раскопки.

## Главное

- Локальный проект: `D:\DEVELOPMENT\strike expo`
- Git remote: `https://github.com/exostring/strike-expo.git`
- Основная ветка: `main`
- Публичный сайт: `https://strike-expo.ru/`
- Старый временный домен `panel.strike-expo.ru` больше не основной.
- Репозиторий переведён в public, поэтому Coolify снова должен уметь тянуть его без GitHub credentials.
- Не коммитить `.agents/` и `skills-lock.json`.

## Стек

- Без фреймворков.
- `server.js` — Node.js stdlib HTTP server.
- `index.html`, `style.css`, `script.js`, `content-loader.js` — публичная страница.
- `admin.html` — простая админка.
- `content.seed.json` — стартовые данные, если на сервере ещё нет сохранённого контента.
- `Dockerfile` — production build для Coolify.

## Данные и админка

- Контент админки хранится не в git, а в Coolify volume:

```text
/app/data/content.json
/app/data/uploads/
```

- При первом запуске сервер создаёт `/app/data/content.json` из `content.seed.json`.
- При redeploy данные не должны слетать, потому что `/app/data` — persistent volume.
- Админка открывается по секретному `ADMIN_PATH`, не `/admin`.
- `ADMIN_PASSWORD`, `SESSION_SECRET`, `ADMIN_PATH` лежат в Coolify env. Не записывать реальные значения в git.
- Если надо узнать текущий секретный путь/пароль — смотреть env в Coolify, а не в репозитории.

## Coolify

- Coolify panel: `https://admin.ra-awards.ru`
- Проект Coolify: `Strike Expo`
- Приложение Coolify: `strike-expo-panel`
- App UUID: `m6uth9lrr0oyy9zk0jm39yom`
- Project UUID: `ks99a4qilkl18xcuctuk87qh`
- Server UUID: `ln9m3z1czbo35u0xtbxbg4tv`
- Build pack: Dockerfile
- Exposed port: `3000`
- Healthcheck: `GET /api/content`, port `3000`
- Domain должен быть `https://strike-expo.ru`
- Volume mount должен быть `/app/data`

Env в Coolify:

```text
PORT=3000
PUBLIC_BASE_URL=https://strike-expo.ru
ADMIN_PATH=/секретный-путь
ADMIN_PASSWORD=секрет
SESSION_SECRET=секрет
DATA_DIR=/app/data
```

## API токены и секреты

- Временный Coolify API token давался в чате, но его нельзя класть в публичный repo.
- Если нужен API token, попросить пользователя выдать новый временный токен или взять его из безопасного менеджера секретов, если он подключён.
- Никогда не писать реальные `ADMIN_PASSWORD`, `SESSION_SECRET`, Coolify token, webhook secrets в md/json/js.

Пример Coolify API без вывода токена:

```powershell
$token = '<COOLIFY_TOKEN>'
$base = 'https://admin.ra-awards.ru/api/v1'
$headers = @{ Authorization = "Bearer $token"; Accept = 'application/json' }
Invoke-RestMethod -Headers $headers -Uri "$base/applications/m6uth9lrr0oyy9zk0jm39yom" -Method Get
```

## Деплой

Обычный flow:

```powershell
git status --short
git add <files>
git commit -m "Message"
git push origin main
```

После пуша Coolify может задеплоить сам. Если надо вручную через API:

```powershell
$token = '<COOLIFY_TOKEN>'
$base = 'https://admin.ra-awards.ru/api/v1'
$appUuid = 'm6uth9lrr0oyy9zk0jm39yom'
$headers = @{ Authorization = "Bearer $token"; Accept = 'application/json' }
Invoke-RestMethod -Headers $headers -Uri "$base/applications/$appUuid/start?force=true" -Method Get
```

Статус деплоя:

```powershell
$deploymentUuid = '<DEPLOYMENT_UUID>'
Invoke-RestMethod -Headers $headers -Uri "$base/deployments/$deploymentUuid" -Method Get
```

Проверка после деплоя:

```powershell
Invoke-WebRequest -Uri 'https://strike-expo.ru/' -UseBasicParsing
Invoke-WebRequest -Uri 'https://strike-expo.ru/api/content' -UseBasicParsing
```

## Важный соседний прод

На этом же сервере есть важный production проект Russian Airsoft Awards.

- Не трогать приложение `russian-airsoft-awards`.
- Не менять домены `ra-awards.ru`, `russian-airsoft-awards.ru`.
- Не делать глобальные правки proxy/server без прямого запроса пользователя.
- Для Strike Expo трогать только app UUID `m6uth9lrr0oyy9zk0jm39yom`.

## SEO

- SEO редактируется в админке.
- Важны VK/TG preview поля:
  - `seo.ogTitle`
  - `seo.ogDescription`
  - `seo.ogImage`
- `twitter*` поля скрыты в админке и при сохранении копируются из VK/TG, чтобы в HTML не оставался старый мусор.
- Social preview image по умолчанию:

```text
https://strike-expo.ru/img/social-cover.webp
```

- `img/social-cover.webp` сделан из `img/Обложка вк.png`, пережат в WebP.
- `server.js` подставляет SEO server-side в `index.html`, чтобы мета-теги видели боты, а не только браузер после JS.

## Участники

- Участники редактируются в админке.
- Только у участников есть добавить/удалить/выше/ниже.
- Ссылки участника:
  - `links.website`
  - `links.vk`
  - `links.max`
  - `links.telegram`
- Иконки появляются на сайте только если ссылка заполнена.
- MAX icon лежит локально: `img/icons/max.svg`, взят из официального brandbook.

## Схема выставки

- Картинка схемы редактируется в админке: `texts.location.schemaImage`.
- Можно загрузить файл, он попадёт в `/app/data/uploads/`.
- Справа от схемы на desktop показывается список `стенд — участник`.
- На mobile этот список скрыт.

## Sandbox / права / PowerShell

- В этом окружении запись в `.git` часто требует escalation. Если `git add/commit` падает на `index.lock` или `Permission denied`, повторить команду с escalated permissions.
- `git push` тоже часто требует escalation/network permission.
- Не использовать destructive команды (`git reset --hard`, `git checkout --`) без явной просьбы.
- PowerShell quoting адский, особенно JSON + `$base/applications/$uuid` + кириллица + кавычки. Для сложных одноразовых API вызовов лучше:
  - писать максимально простой PowerShell;
  - или использовать маленький `.ps1`/Node script и запускать его;
  - не собирать сложные команды с кучей экранирования прямо в одну строку.
- В PowerShell строка `"$base/applications/$uuid"` может интерпретироваться неприятно, чаще безопаснее `"${base}/applications/${uuid}"`.
- Не печатать токены в stdout/tool output.

## Быстрые локальные проверки

```powershell
node --check server.js
node --check content-loader.js
node -e "JSON.parse(require('fs').readFileSync('content.seed.json','utf8')); console.log('content.seed.json ok')"
```

Проверка встроенных `<script>` в HTML:

```powershell
node -e "const fs=require('fs'); for (const f of ['admin.html','index.html','offer.html']) { const html=fs.readFileSync(f,'utf8'); const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]); for (const s of scripts) new Function(s); console.log(f+' scripts ok'); }"
```

Локальный запуск:

```powershell
$env:PORT='8787'
$env:ADMIN_PATH='/local-control'
$env:ADMIN_PASSWORD='test'
$env:SESSION_SECRET='local-test-secret'
$env:DATA_DIR="$PWD\data"
node server.js
```

Открыть:

```text
http://127.0.0.1:8787/
http://127.0.0.1:8787/local-control
```
