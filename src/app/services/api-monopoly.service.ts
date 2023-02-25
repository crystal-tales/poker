import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiMonopolyService {
    uri = 'http://localhost:7777';

    constructor(private httpClient: HttpClient) { }

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

    public getAllPlayers() {
        return this.httpClient.get(this.uri + '/api/m/players').pipe(catchError(this.handleError));
    }

    public getGame() {
        return this.httpClient.get(this.uri + '/api/m/game').pipe(catchError(this.handleError));
    }

    public postStartGame(selectedPlayers: Array<string>) {
        return this.httpClient.post(this.uri + '/api/m/game', {players: selectedPlayers}).pipe(catchError(this.handleError));
    }

    public getNewTurn() {
        return this.httpClient.get(this.uri + '/api/m/game/turn').pipe(catchError(this.handleError));
    }

    public postGameDuress() {
        return this.httpClient.get(this.uri + '/api/m/game/duress').pipe(catchError(this.handleError));
    }

    public postCellBuy(cell: any) {
        return this.httpClient.post(this.uri + '/api/m/cell/buy/' + cell, {}).pipe(catchError(this.handleError));
    }

    public postCellUpgrade(cell: any) {
        return this.httpClient.post(this.uri + '/api/m/cell/upgrade/' + cell, {}).pipe(catchError(this.handleError));
    }
}
