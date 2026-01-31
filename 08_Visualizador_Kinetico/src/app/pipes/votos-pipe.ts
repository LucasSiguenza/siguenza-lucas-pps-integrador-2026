import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'votos'
})
export class VotosPipe implements PipeTransform {

  transform(value: number): string |  number {
    if( value === 0){
      return 'Aún no hay votos dispoblibes'
    };
    return value;
  }

}
