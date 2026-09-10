import { Component, signal } from '@angular/core'; // декоратор компонента, сигнал реактивное значение
import { RouterOutlet } from '@angular/router'; // директива куда роутер подставляет компонент текущей страницы 

// Angular syntax
@Component({ // создается компонент корня приложения
  imports: [RouterOutlet], // подключаются маршруты
  selector: 'app-root', // кастомный html тег компонента
  styleUrl: './app.css', // стили
  templateUrl: './app.html', // шаблон компонента (по дефолту - рекламная страница ангулар)
})

/* схема связи элементов роутинга из конфига и компонента:

  URL /home
      ↓
  provideRouter(routes)  →  нашёл { path: 'home', component: Home }
      ↓
  <router-outlet>        →  сюда рендерится <app-home>
*/

// TypeScript syntax
export class App { // создается класс (без интерфейса)
  protected readonly title = signal('firstAngular'); // доступ только для чтения и у подклассов и внутри класа, сигнал обновляет шаблон при изменении состояния
}
