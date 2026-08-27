import { bootstrapApplication } from '@angular/platform-browser'; // import the bootstrap method for the app
import { appConfig } from './app/app.config'; // import config file
import { App } from './app/app'; // import application

bootstrapApplication(App, appConfig) // в фунцию запуска передается корневой компонент и конфиг
  .catch((err) => console.error(err)); // все ошибки в рантайме выводятся в консоль
