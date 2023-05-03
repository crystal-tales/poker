import {Pipe, PipeTransform} from '@angular/core';
import {orderBy} from 'lodash';

@Pipe({name: 'orderBy'})
export class OrderByPipe implements PipeTransform {
    transform(value: any[], order: any = '', column: string = ''): any[] {
        // no array
        if (!value || order === '' || !order) {
            return value;
        }
        // array with only one item
        if (value.length <= 1) {
            return value;
        }
        // sort 1d array
        if (!column || column === '') {
            if (order === 'asc') {
                return value.sort()
            } else {
                return value.sort().reverse();
            }
        }
        return orderBy(value, [column], [order]);
    }
}
