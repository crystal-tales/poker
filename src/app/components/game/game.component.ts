import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';

// const bidSteps = [1, 2, 5, 6];
// const callSteps = [1, 2, 3, 5, 6, 7];
// const dropSteps = [1, 2, 3, 5, 6, 7];
const maxChats = 12;
const chatDelay = 500;

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
    rivals: any = [];
    you: any = {};
    game: any = {};
    currentImgs: any = {};
    colors = ['crimson', 'goldenrod', 'dodgerblue', 'limegreen'];
    chats: any[] = [];
    discardedCards: any[] = [];
    loading = false;
    endGame = false;
    winnerYou = false;

    constructor(private apiService: ApiService, private toast: ToastrService, private router: Router) {
    }

    ngOnInit(): void {
        this.refresh(true);
    }

    /*
        Player
            name
            imagesSet: {stage:[img.jpg, img2.jpg]}
            strategy
            hand
            money
            currentStage
            decision: {step:call|fold...}
            old
            lastStage
            leftStages
     */

    /*
       game: {
                pot: this._pot,
                toYou: this._toYou,
                currentPlayer: this._currentPlayer
                 currentStep: this._currentStep
           },
            rivals: plys,
            you: you
     */
    refresh(first: boolean = false) {
        this.loading = true;
        this.apiService.getGame().subscribe({
            next: (response: any) => {
                this.saveGameData(response).then(() => {
                    if (first) {
                        this.chats.push({who: '#system', msg: 'Player starting: ' + this.game.currentPlayer});
                    }
                });
            },
            error: (err: Error) => console.error('Error getting game data: ' + err)
        });
    }

    changeImg(rival: any) {
        const max = rival['imagesSet'][rival['currentStage']].length - 1;
        // Rotamos imgs
        if (this.currentImgs[rival['name']] === undefined) {
            this.currentImgs[rival['name']] = 0;
        } else {
            this.currentImgs[rival['name']]++;
        }

        if (this.currentImgs[rival['name']] > max) {
            this.currentImgs[rival['name']] = 0;
        }
    }

    getImg(rival: any) {
        // Rotamos imgs
        if (this.currentImgs[rival['name']] === undefined) {
            this.currentImgs[rival['name']] = Math.floor(Math.random() * rival['imagesSet'][rival['currentStage']].length);
        }
        // console.log(rival);
        const theImg = rival['imagesSet'][rival['currentStage']][this.currentImgs[rival['name']]];
        return 'url("http://localhost:7777/players/' + rival['name'] + '/' + theImg + '")';
    }

    getBackgroundColor(rival: any) {
        const img = rival['imagesSet'][rival['currentStage']][this.currentImgs[rival['name']]];

        if (isNaN(parseInt(img.charAt(0)))) {
            return '#404040';
        } else {
            return 'black';
        }
    }

    // Reparto inicial de cartas
    dealAction() {
        this.loading = true;
        this.apiService.postInitialDeal().subscribe({
            next: async (response: any) => {
                this.saveGameData(response).then(() => {
                    // Si me toca a mí espero por acción, si no pido al servidor acciones
                    if (this.game.currentPlayer !== 'you') {
                        // await this.delay(500);
                        this.iaActions();
                    }
                });
            },
            error: (err: Error) => console.error('Error initial deal: ' + err)
        });
    }

    iaActions() {
        this.loading = true;
        this.apiService.getIAActions().subscribe({
            next: (response: any) => {
                this.saveGameData(response).then();

                // Ahora me toca a mí ejecutar acción, salvo que estemos en el último paso
                /* if (this.game.currentStep === 8) {
                     // Muestro la resolucion del turno que me ha venido en la respuesta
                     // TODO
                     this.loading = true;
                     // Pongo el step a 0 llamando a la api para preparar el inicio del siguiente
                     this.apiService.postPrepareTurn().subscribe({
                         next: (response: any) => {
                             this.saveGameData(response);
                         },
                         error: (err: Error) => console.error('Error prepare turn: ' + err)
                     });
                 }*/
            },
            error: (err: Error) => console.error('Error IA Actions: ' + err)
        });
    }

    // Proceso una respuesta con los datos del game
    private saveGameData(response: any) {
        return new Promise(resolve => {
            if (!response.actions) {
                response.actions = [];
            }
            // Chat
            this.addChatActions(response.actions)
                .then(() => {
                    // Datos
                    let n = 0;
                    response.data.rivals.forEach((r: any) => {
                        r.color = this.colors[n];
                        n++;
                    });

                    this.game = response.data.game;
                    this.rivals = response.data.rivals;
                    this.you = response.data.you;
                    this.loading = false;

                    if (response.data.final) {
                        this.endGame = response.data.final.endGame;
                        this.winnerYou = response.data.final.areYouWinner;
                    }

                    resolve(true);
                    console.log(response.data);
                });
        });
    }

    getCardImg(image: string) {
        return 'url("http://localhost:7777/cards/' + image + '")';
    }

    getChatColor(chat: any) {
        let color = '#CCC';
        this.rivals.forEach((r: any) => {
            if (r.name === chat.who) {
                color = r.color;
            }
            if (chat.who === '#system') {
                color = '#FF0';
            }
            if (chat.who === '#separator') {
                color = '#444444';
            }
        });

        return color;
    }

    getChatStyle(chat: any) {
        if (chat.who === '#system' || chat.who === '#separator') {
            return 'italic';
        } else {
            return 'normal';
        }
    }

    getChatAlign(chat: any) {
        if (chat.who === '#system') {
            return 'right';
        } else if (chat.who === '#separator') {
            return 'center';
        } else {
            return 'left';
        }
    }

    addChatActions(actions: any) {
        return new Promise(resolve => {
            let n = 1;
            actions.forEach(async (act: any) => {
                setTimeout(() => {
                    if (this.chats.length > maxChats) {
                        this.chats.pop();
                    }
                    this.chats.unshift(act);
                }, chatDelay * n);
                n++;
            });
            // Resuelvo pasado el tiempo necesario para mostrar el chat
            setTimeout(() => {resolve(true);}, chatDelay * actions.length);
        });
    }

    restRivals() {
        if (this.rivals.length > 2) {
            return Array(4 - this.rivals.length).fill('');
        } else {
            return [];
        }
    }

    canBid(amount: number) {
        if (!this.game.possibleYouActions) return false;
        return this.game.possibleYouActions['bid' + amount];
    }

    canCall() {
        if (!this.game.possibleYouActions) return false;
        return this.game.possibleYouActions.call;
    }

    canFold() {
        if (!this.game.possibleYouActions) return false;
        return this.game.possibleYouActions.fold;
    }

    canDiscard() {
        if (!this.game.possibleYouActions) return false;
        return this.game.possibleYouActions.discard;
    }

    canStay() {
        if (!this.game.possibleYouActions) return false;
        return this.game.possibleYouActions.stay;
    }

    canCheat(number: number) {
        if (!this.game.possibleYouActions) return false;
        return this.game.possibleYouActions['cheat' + number];
    }

    /**
     * CHEATS
     */
    cheatShowCards() {
        this.loading = true;
        this.apiService.getCheatShowCards().subscribe({
            next: (response: any) => {
                this.saveGameData(response).then();
            },
            error: (err: Error) => this.toast.error(err.toString())
        });
    }

    cheatCannotFold() {
        this.loading = true;
        this.apiService.getCheatCannotFold().subscribe({
            next: (response: any) => {
                this.saveGameData(response).then();
                this.toast.success('Your rivals can`t fold during this game!', 'You cheated!');
            },
            error: (err: Error) => this.toast.error(err.toString())
        });
    }

    cheatWinningHand() {
        this.loading = true;
        this.apiService.getCheatWinningHand().subscribe({
            next: (response: any) => {
                this.saveGameData(response).then();
                this.toast.success('Your hand will win even if it sucks!', 'You cheated!');
            },
            error: (err: Error) => this.toast.error(err.toString())
        });
    }

    discard(card: any) {
        if (this.game.possibleYouActions.discard) {
            if (this.discardedCards.includes(card.id)) {
                const index = this.discardedCards.indexOf(card.id);
                if (index > -1) {
                    this.discardedCards.splice(index, 1);
                }
            } else {
                this.discardedCards.push(card.id);
            }
        }
    }

    isDiscarded(card: any) {
        return this.discardedCards.includes(card.id);
    }

    /**
     * ACTIONS
     */
    discardAction() {
        this.loading = true;
        // this.addChatActions([{who: 'you', msg: 'I discard ' + this.discardedCards.length + ' cards.'}]).then();
        this.apiService.postHumanActionDiscard(this.discardedCards).subscribe({
            next: (response: any) => {
                this.saveGameData(response).then(() => {
                    this.discardedCards = [];
                });
            },
            error: (err: Error) => this.toast.error(err.toString())
        });
    }

    stayAction() {
        this.loading = true;
        // this.addChatActions([{who: 'you', msg: 'I stay.'}]).then();
        this.apiService.getHumanActionStay().subscribe({
            next: (response: any) => {
                // TODO tengo algo que hacer si se termina la partida???
                this.saveGameData(response).then();
            },
            error: (err: Error) => this.toast.error(err.toString())
        });
    }

    callAction() {
        this.loading = true;
        // this.addChatActions([{who: 'you', msg: 'I call.'}]).then();
        this.apiService.getHumanActionCall().subscribe({
            next: (response: any) => {
                // TODO tengo algo que hacer si se termina la partida???
                this.saveGameData(response).then();
            },
            error: (err: Error) => this.toast.error(err.toString())
        });
    }

    foldAction() {
        this.loading = true;
        // this.addChatActions([{who: 'you', msg: 'I fold.'}]).then();
        this.apiService.getHumanActionFold().subscribe({
            next: (response: any) => {
                // TODO tengo algo que hacer si se termina la partida???
                this.saveGameData(response).then();
            },
            error: (err: Error) => this.toast.error(err.toString())
        });
    }

    bidAction(amount: number) {
        this.loading = true;
        // this.addChatActions([{who: 'you', msg: 'I bid.'}]).then();
        this.apiService.postHumanActionBid(amount).subscribe({
            next: (response: any) => {
                // TODO tengo algo que hacer si se termina la partida???
                this.saveGameData(response).then();
            },
            error: (err: Error) => this.toast.error(err.toString())
        });
    }

    delay(milliseconds: number) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    newGame() {
        this.router.navigate(['/']).catch(e => {console.error(e);});
    }

    addRival() {
        // TODO
    }

    getCols() {
        if (this.rivals.length === 1) {
            return 2;
        } else {
            return 1;
        }
    }

    getRows() {
        if (this.rivals.length === 1 || this.rivals.length === 2) {
            return 2;
        } else {
            return 1;
        }
    }
}
