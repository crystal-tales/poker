import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
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
        return this.httpClient.get(this.uri + '/api/players').pipe(catchError(this.handleError));
    }

    public getGame() {
        return this.httpClient.get(this.uri + '/api/game').pipe(catchError(this.handleError));
    }

    public getHumanActionStay() {
        return this.httpClient.get(this.uri + '/api/player/stay').pipe(catchError(this.handleError));
    }

    public getHumanActionCall() {
        return this.httpClient.get(this.uri + '/api/player/call').pipe(catchError(this.handleError));
    }

    public getHumanActionFold() {
        return this.httpClient.get(this.uri + '/api/player/fold').pipe(catchError(this.handleError));
    }

    public postHumanActionBid(amount: number) {
        return this.httpClient.post(this.uri + '/api/player/bid/' + amount, {}).pipe(catchError(this.handleError));
    }

    public postHumanActionDiscard(cards: any) {
        return this.httpClient.post(this.uri + '/api/player/discard', {cards: cards}).pipe(catchError(this.handleError));
    }

    public getCheatShowCards() {
        return this.httpClient.get(this.uri + '/api/cheat/show-cards').pipe(catchError(this.handleError));
    }

    public getCheatCannotFold() {
        return this.httpClient.get(this.uri + '/api/cheat/cannot-fold').pipe(catchError(this.handleError));
    }

    public getCheatWinningHand() {
        return this.httpClient.get(this.uri + '/api/cheat/winning-hand').pipe(catchError(this.handleError));
    }

    public getIAActions() {
        return this.httpClient.get(this.uri + '/api/game/ia').pipe(catchError(this.handleError));
    }

    public postInitialDeal() {
        return this.httpClient.post(this.uri + '/api/game/new-turn', {}).pipe(catchError(this.handleError));
    }

    public postStartGame(selectedPlayers: Array<string>) {
        const body = {
            players: selectedPlayers
        };
        return this.httpClient.post(this.uri + '/api/game', body).pipe(catchError(this.handleError));
    }

    public postNewRival(body: any, files: any) {
        const formData: FormData = new FormData();

        for (let i = 0; i <= 5; i++) {
            for (let j = 0; j < files[i].length; j++) {
                formData.append('stage' + i, files[i][j].file, files[i][j].file.name);
            }
        }
        if (files['portrait'] !== null) {
            formData.append('portrait', files['portrait'].file, files['portrait'].file.name);
        }
        formData.append('data', JSON.stringify(body));
        return this.httpClient.post(this.uri + '/api/player/create', formData).pipe(catchError(this.handleError));
    }
}
