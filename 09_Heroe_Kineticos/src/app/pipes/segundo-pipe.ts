import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'segundos',
  standalone: true
})
export class SegundosPipe implements PipeTransform {

  transform(value: number | string): string {
    const num = Number(value);

    if (isNaN(num)) return '0.00';

    return num.toFixed(2);
  }
}
