import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {

  // 1. сигнал имени 

  // создаем простой сигнал и задаем ему исходное значение
  protected readonly name = signal('Allan');

  // записываем в name новое значение через .set()
  // value приходит из формы
  setName(value: string) {
    this.name.set(value);
  }

  // собираем новую строку, используя computed() сигнал, который не хранит исходные данные, а вычисляется из других сигналов
  // в строку вставляется значение сигнала name
  protected readonly greeting = computed(() => `Hello, ${this.name()}!`);


  // 2. сигнал счетчика нажатий

  // простой сигнал count с исходным значением
  protected readonly count = signal(0);

  // computed() = тоже сигнал, он не хранит значения, а вычисляется из других сигналов (read-only)
  // значение выводится из сигнала count и обрабатывается по своему
  protected readonly doubled = computed(() => this.count() * 2);

  // Обновляем через .update() — прибавляем единицу за каждый новый клик
  increment() {
    this.count.update((n) => n + 1);
  }

  // обнуляем count через .set(0)
  reset() {
    this.count.set(0);
  }
}
