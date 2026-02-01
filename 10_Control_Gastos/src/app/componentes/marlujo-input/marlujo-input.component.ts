import { Component, Input } from '@angular/core';
import { IonInput, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';

import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-marlujo-input',
  standalone: true,
  templateUrl: './marlujo-input.component.html',
  styleUrls: ['./marlujo-input.component.scss'],
  imports: [
    IonIcon,
    IonInput,
    IonLabel,
    ReactiveFormsModule,
    TitleCasePipe,
  ],
})
export class MarlujoInputComponent {
  protected verPassword = false;

  @Input({ required: true }) placeholder!: string;
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) control!: string | null;
  @Input() tipo: string = 'text';
  @Input() mensajeAdicional: string = '';

  // 🆕 límites de caracteres (opcionales)
  @Input() minLength?: number;
  @Input() maxLength?: number;

  constructor() {
    addIcons({
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
    });
  }

  get formControl(): FormControl {
    return this.form.get(this.control!) as FormControl;
  }

  // 🧠 Limita caracteres en number
  limitarLongitud(ev: any) {
    if (this.tipo !== 'number' || this.maxLength == null) return;

    const valor: string = ev.target.value ?? '';

    if (valor.length > this.maxLength) {
      const recortado = valor.slice(0, this.maxLength);
      this.formControl.setValue(recortado);
    }
  }
}
