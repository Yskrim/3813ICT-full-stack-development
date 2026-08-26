// файл глобальной конфигурации приложения
// передается в bootstrapApplication(App, appConfig) в main.ts

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core'; 
// ApplicationConfig -- тип обьекта конфига, как раз тот интерфейс, который тайпскрипт обязуется выполнять
// provideBrowserGlobalErrorListeners -- функция провайдер, подключает глобальные слушатели ошибок в браузере, чтобы логировать их в Ангулар

import { provideRouter } from '@angular/router'; // функция, обрабатывающая маршруты
import { routes } from './app.routes'; // список маршрутов, которые я должен буду описать по мере работы над проектом

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // инициализирует слушатель ошибок.
    provideRouter(routes) // принимает мои маршруты. добавляет функционал роутинга
  ]
};
