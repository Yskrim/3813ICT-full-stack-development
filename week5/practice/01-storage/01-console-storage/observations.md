TASK [01-console.storage](http://01-console.storage)

**Часть А — строки и только строки**

1. Сохрани в localStorage строку под ключом `theme`, прочитай её, удали. Какие три метода ты использовал?
  > ```
  > localStorage.setItem('theme', 'dark'); 
  > localStorage.getItem('theme');
  > localStorage.removeItem('theme');
  > ```
2. Прочитай ключ, которого нет. Что вернулось?
  > ```
  > localStorage.getItem('theme') 
  > // null
  > ```
3. Сохрани объект `{ id: 2, username: 'anna' }` без преобразования, прочитай. Что лежит в хранилище? Посмотри в Application.
  > ```
  > localStorage.setItem("{ id: 2, username: 'anna' }"); 
  > ```
  >
  > // Uncaught TypeError: Failed to execute 'setItem' on 'Storage': 2 arguments required, but only 1 present.
  > ```
4. Сохрани тот же объект правильно и прочитай обратно так, чтобы получился объект. Проверь `typeof` результата.
  > ```
  > localStorage.setItem("user", JSON.stringify({ id: 2, username: 'anna' }));
  > ```
  >
  > ```
  > localStorage.getItem("user")  
  > // '{"id":2,"username":"anna"}'
  > ```
5. Сохрани `false` под ключом `muted`. Напиши `if` по прочитанному значению и посмотри, какая ветка сработает. Затем напиши правильную проверку.
  > ```
  > localStorage.setItem("muted", false);
  > ```
  >
  > ```
  > console.log(localStorage.getItem('muted') === 'true');  
  > // false
  > ```

**Часть Б — кто видит данные**

1. Запиши значение в localStorage и в sessionStorage. Открой **новую вкладку** на тот же адрес вручную и попробуй прочитать оба значения.
  > ```
  > localStorage.setItem("partB", 'localValue');
  > sessionStorage.setItem("partB", 'sessionValue');
  > ```
  >
  > ```
  > localStorage.getItem('partB')
  > // 'localValue'
  >
  > sessionStorage.getItem('partB')
  > // null
  > ```
2. В исходной вкладке нажми F5. Что осталось?
  > ```
  > localStorage.getItem('partB')
  > // 'localValue'
  >
  > sessionStorage.getItem('partB') 
  > // 'sessionValue'
  > ```
3. Сделай «Дублировать вкладку» и проверь sessionStorage в дубликате. Измени значение в дубликате — изменилось ли оно в исходной вкладке?
  > ```
  > sessionStorage.setItem('theme', 'dark');
  > sessionStorage.getItem('theme');
  > 'dark'
  >
  > sessionStorage.setItem('theme', 'light');
  > sessionStorage.getItem('theme');
  > 'light'
  > ```
  > Нет не изменилось, потому что новая сессия при дублировании получает дубликат значений на момент создания, а потом живет отдельно.
4. Запусти сервер из `server/` и открой [http://localhost:3000/api/health](http://localhost:3000/api/health). В консоли этой вкладки прочитай localStorage. Видны ли данные, записанные на 4200? Почему?
  > ```
  > sessionStorage.getItem('theme')
  > null
  > ```
  >
  >   Данные порта 4200 не видны, потому что это другой ориджин и у порта 3000 нет доступа к хранилищу 4200

**Часть В — куки**

1. Создай сессионную куку `lang=ru` и постоянную `theme=dark` на 7 дней (обе с `path=/`). Прочитай `document.cookie`.
  задаем:
  > ```
  > document.cookie = `lang=ru: path:/`
  > 'lang=ru; theme=dark; path=/; max-age=604800'
  > document.cookie = `theme=dark: path:/; max-age=${60 * 60 * 24 * 7}`
  > 'theme=dark; path=/; max-age=604800'
  > ```
  читаем:
  > ```
  > document.cookie
  > 'lang=ru; theme=dark'
  > ```
2. Закрой вкладку, **не закрывая браузер**, открой сайт в новой — какие куки остались?
  новая вкладка:
  > ```
  > document.cookie
  > 'lang=ru; theme=dark'
  > ```
3. Удали куку `theme`. Какой атрибут обязательно нужно указать, чтобы удаление сработало?
  Удаляем `theme`
  > ```
  > document.cookie = `theme=; max-age=0; path=/`
  > 'theme=; max-age=0; path=/'
  > ```
  Читаем заново
  > ```
  > document.cookie
  > 'lang=ru'
  > ```
4. Найди куки в Application → Cookies. Какие у них атрибуты?
  Путь: DevTools -> Application -> Cookies
  > ```
  > Name: lang; 
  > Value: ru; 
  > Domain:localhost; 
  > Path:/; 
  > Expires/Max-age: Session (пока не закроется браузер)
  > Size:6; (размер в байтах: по одному на каждый символ в куке [l a n g r u]=9 символов, а = не считается)
  > Priority:Medium 
  > ```
  > ```
  > Name: theme; 
  > Value: dark; 
  > Domain:localhost; 
  > Path:/; 
  > Expires/Max-age: 2026-10-04T09:14:59.839Z; (isoString через неделю от момента записи);
  > Size:9; (размер в байтах: по одному на каждый символ в куке [t h e m e d a r k]=9 символов, а = не считается)
  > Priority:Medium 
  > ```
  - HttpOnly нету, задает только сервер (наш не задавал)
  - Secure == нету, не задавали
  - SameSite == нету, не задавали
  - Partition key == нету, данные не передавали
  - Cross Site == нету, корс не задавали

