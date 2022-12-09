import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sortHand'
})
export class SortHandPipe implements PipeTransform {

    transform(value: any[]): any[] {
        if (!value) {
            return [];
        }
        return value.sort((n1, n2) => {
            if (!n1.value || !n2.value) {
                return 0;
            }
            return n1.value - n2.value;
        });
    }

}
