import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiBarService {
    uri = 'http://localhost:7777';

    constructor(private httpClient: HttpClient) {
    }

    /*
      Manage the errors
     */
    handleError(error: HttpErrorResponse) {
        let errorMessage = '';
        if (error['error']['message']) {
            errorMessage = error.error.message;
        } else {
            errorMessage = `Code: ${error.status}. Error: ${error.message}`;
        }

        // Si viene mensaje
        if (error['error'] && error['error']['error']) {
            errorMessage = error['error']['error'];
        }
        return throwError(() => new Error(errorMessage));
    }


    public getGame() {
        return this.httpClient.get(this.uri + '/api/b/game').pipe(catchError(this.handleError));
    }

    public postStartGame() {
        return this.httpClient.post(this.uri + '/api/b/game', {}).pipe(catchError(this.handleError));
    }

    public getNextHour() {
        return this.httpClient.get(this.uri + '/api/b/game/hour').pipe(catchError(this.handleError));
    }

    public postBuyPlayer(playerId: any) {
        return this.httpClient.post(this.uri + '/api/b/player/buy/' + playerId, {}).pipe(catchError(this.handleError));
    }
}
