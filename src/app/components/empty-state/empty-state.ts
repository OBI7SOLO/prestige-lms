import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300"
    >
      <!-- Icono de documento vacío minimalista (Colores USA: Azul y Rojo acento) -->
      <div class="h-24 w-24 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
        <svg class="w-12 h-12 text-[#0a3161]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-[#0a3161] mb-1">{{ title }}</h3>
      <p class="text-slate-500 max-w-sm">{{ message }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title: string = 'No data found';
  @Input() message: string = 'There is no information to display here at the moment.';
}
