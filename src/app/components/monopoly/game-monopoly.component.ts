import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { ApiMonopolyService } from '../../services/api-monopoly.service';

// const bidSteps = [1, 2, 5, 6];
// const callSteps = [1, 2, 3, 5, 6, 7];
// const dropSteps = [1, 2, 3, 5, 6, 7];
const maxChats = 12;
const chatDelay = 500;

@Component({
    selector: 'app-game-monopoly',
    templateUrl: './game-monopoly.component.html',
    styleUrls: ['./game-monopoly.component.scss']
})
export class GameMonopolyComponent implements OnInit {
    rivals: any = [];
    you: any = {};
    game: any = {board: {cells: []}};
    currentImgs: any = {};
    chats: any[] = [];
    discardedCards: any[] = [];
    loading = false;
    endGame = false;
    winnerYou = false;
    selectedCell: any = {type: '', level: 1};
    cellsRivals: any = {};
    canBuy = false;
    canUpgrade = false;
    firstTurn = true;
    message = '';
    police = 0;
    inspector = 0;
    mafia = 0;
    corruption = 0;

    constructor(private apiMonopolyService: ApiMonopolyService, private toast: ToastrService, private router: Router, public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.refresh(true);
    }

    refresh(first: boolean = false) {
        this.loading = true;
        this.apiMonopolyService.getGame().subscribe({
            next: (response: any) => {
                this.game = response.data.game;
                this.rivals = response.data.rivals;
                this.loading = false;

                /*if (response.data.final) {
                    this.endGame = response.data.final.endGame;
                    this.winnerYou = response.data.final.areYouWinner;
                }*/
                this.paintBoard();
            },
            error: (err: Error) => console.error('Error getting game data: ' + err)
        });
    }

    paintBoard() {
        console.log(this.game);

        this.nextTurn();
    }

    getCell(id: any) {
        let c = null;
        this.game.board.cells.forEach((cell: any) => {
            if (cell.id === id) {
                c = cell;
            }
        });
        return c;
    }

    getCellImg(cell: any) {
        let lvl = cell['level'];
        if (cell.type === 'hotel' && !cell.owned) {
            lvl = 0;
        }
        return 'url("http://localhost:7777/board/' + cell['type'] + lvl + '.png")';
    }

    selectCell(cell: any) {
        if (cell === null) {
            this.selectedCell = {type: '', level: 1};
        } else {
            this.selectedCell = cell;
            this.checkBuy(cell);
            this.checkUpgrade(cell);
        }
    }

    checkBuy(cell: any) {
        if (cell.type === 'hotel') {
            this.canBuy = !cell.owned && (cell.costs[cell.type]['1'] <= this.game.money);
        }
    }

    buyCell(cell: any) {
        this.apiMonopolyService.postCellBuy(cell.id).subscribe({
            next: (response: any) => {
                this.game = response.data.game;
                this.rivals = response.data.rivals;
                this.checkBuy(this.getCell(cell.id));
                this.checkUpgrade(this.getCell(cell.id));
            },
            error: (err: Error) => console.error('Error buying cell: ' + err)
        });
    }

    buyAllCell() {
        let obs: any[] = [];
        this.game.board.cells.forEach((cell: any) => {
            if (cell.type === 'hotel' && cell.owned === false) {
                obs.push(this.apiMonopolyService.postCellBuy(cell.id));
            }
        });

        forkJoin(obs)
            .subscribe({
                next: (response: any) => { },
                complete: () => {
                    this.apiMonopolyService.getGame().subscribe({
                        next: (response: any) => {
                            this.game = response.data.game;
                            this.rivals = response.data.rivals;
                            this.game.board.cells.forEach((cell: any) => {
                                if (cell.type === 'hotel') {
                                    this.checkBuy(this.getCell(cell.id));
                                    this.checkUpgrade(this.getCell(cell.id));
                                }
                            });
                        },
                        error: (err: Error) => console.error('Error getting game info: ' + err)
                    });
                }
            });
    }

    checkUpgrade(cell: any) {
        if (cell.type === 'hotel') {
            this.canUpgrade = cell.owned && (cell.costs[cell.type]['' + (cell.level + 1)] <= this.game.money) && cell.level < this.maxLevel(cell);
        }
    }

    upgradeCell(cell: any) {
        this.apiMonopolyService.postCellUpgrade(cell.id).subscribe({
            next: (response: any) => {
                this.game = response.data.game;
                this.rivals = response.data.rivals;
                this.checkBuy(this.getCell(cell.id));
                this.checkUpgrade(this.getCell(cell.id));
            },
            error: (err: Error) => console.error('Error upgrading cell: ' + err)
        });
    }

    maxLevel(cell: any) {
        const costs = Object.keys(cell.costs[cell.type]).reverse();
        return costs[0];
    }

    nextTurn() {
        // Deselecciono
        this.selectedCell = {type: '', level: 1};
        this.message = '';

        if (this.firstTurn) {
            this.firstTurn = false;
            this.checkRivalsInCells();
            this.checkCounters();
            return;
        }

        this.apiMonopolyService.getNewTurn().subscribe({
            next: (response: any) => {
                this.game = response.data.game;
                this.rivals = response.data.rivals;
                if (response.message) {
                    this.message = response.message;
                }
                this.checkRivalsInCells();
                this.checkCounters();

                // Si cambió la corrupción mostraré resultados
                console.log(response);
                if (response.corrupt) {
                    const r = this.getRival(this.game.currentRival);
                    console.log(r);
                    if (r !== null) {
                        if (r['corruption'] < 4) {
                            this.fullViewImg(this.getImg(r, false));
                        } else {
                            this.fullViewVideo(r);
                        }
                    }
                }
            },
            error: (err: Error) => console.error('Error going to next turn: ' + err)
        });
    }

    getRival(id: any) {
        let ret = null;
        this.rivals.forEach((rival: any) => {
            if (rival.name == id) {
                ret = rival;
            }
        });
        return ret;
    }

    checkRivalsInCells() {
        this.cellsRivals = {};
        this.rivals.forEach((rival: any) => {
            if (!this.cellsRivals[rival.currentCellId]) {
                this.cellsRivals[rival.currentCellId] = [];
            }
            this.cellsRivals[rival.currentCellId].push({color: rival.color, name: rival.name});
        });
    }

    checkCounters() {
        this.police = this.game.counters.police;
        this.inspector = this.game.counters.inspector;
        this.mafia = this.game.counters.mafia;
        this.corruption = this.game.counters.corruption;
    }


    getImg(rival: any, urlWrap: boolean = true) {
        let cStage = '';
        // console.log(JSON.stringify(rival));
        switch (rival['corruption']) {
            case 0:
                cStage += (rival['old'] === false) ? 5 : 1;
                break;
            case 1:
                cStage += (rival['old'] === false) ? 3 : 2;
                break;
            case 2:
                cStage += (rival['old'] === false) ? 2 : 3;
                break;
            default:
                cStage += (rival['old'] === false) ? 0 : 5;
                break;
        }
        // console.log(cStage);
        if (cStage === '') {
            console.debug('cStage undefined ' + rival.name);
        }
        // console.log(JSON.stringify(rival));
        // Rotamos imgs
        if (this.currentImgs[rival['name']] === undefined) {
            this.currentImgs[rival['name']] = Math.floor(Math.random() * rival['imagesSet'][cStage].length);
        }
        // console.log(rival);
        const theImg = rival['imagesSet'][cStage][this.currentImgs[rival['name']]];
        if (theImg === undefined) {
            console.debug('IMG undefined:');
            console.debug(rival);
            console.debug(this.currentImgs);
        }
        if (urlWrap) {
            return 'url("http://localhost:7777/players/' + rival['name'] + '/' + theImg + '")';
        } else {
            return 'http://localhost:7777/players/' + rival['name'] + '/' + theImg;
        }
    }

    activeRivals(current: any = true) {
        let found = false, prev: any[] = [], last: any[] = [];
        this.rivals.forEach((rival: any) => {
            if (!rival.out) {
                if (this.game.currentRival === rival.name) {
                    found = true;
                }
                if (current || (!current && this.game.currentRival !== rival.name)) {
                    // actives.push(rival);
                    if (!found) {
                        prev.push(rival);
                    } else {
                        last.push(rival);
                    }
                }
            }
        });
        return [...last, ...prev];
    }

    getBuyCost(cell: any) {
        return cell.costs[cell.type]['1'];
    }

    getUpgradeCost(cell: any) {
        if (!cell.owned) {
            return '';
        }
        return cell.costs[cell.type]['' + (cell.level + 1)];
    }

    getAllCost() {
        let amount = 0;
        this.game.board.cells.forEach((cell: any) => {
            if (cell.type === 'hotel' && cell.owned === false) {
                amount += cell.costs['hotel']['1'];
            }
        });
        return amount;
    }

    /**
     * Returns rivals in this cellId
     * @param cellId
     */
    rivalsInThisCell(cellId: any) {
        return this.cellsRivals[cellId];
    }

    fullViewImg(img: string) {
        this.dialog.open(FullViewMonopolyDialog, {
            width: '90vw',
            height: '95vh',
            data: {
                source: img
            }
        });
        return false;
    }

    fullViewVideo(rival: any) {
        let cat = 0;
        switch (rival['corruption']) {
            case 4:
            case 5:
            case 6:
                cat = 4;
                break;
            case 7:
            case 8:
            case 9:
                cat = 5;
                break;
        }
        let videoUrl = 'http://localhost:7777/api/m/video/' + rival['name'] + '/' + cat;
        this.dialog.open(FullViewVideoMonopolyDialog, {
            width: '90vw',
            height: '95vh',
            data: {
                source: videoUrl
            }
        });
        return false;
    }


    newGame() {
        this.router.navigate(['/']).catch(e => {console.error(e);});
    }

    return() {
        const dialogRef = this.dialog.open(ConfirmMonopolyDialog);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.newGame();
            }
        });
    }

    //////////////////////////
    //////////////////////////
    //////////////////////////
    //////////////////////////
    //////////////////////////

    /*
        getBackgroundColor(rival: any) {
            const img = rival['imagesSet'][rival['currentStage']][this.currentImgs[rival['name']]];
            let color = 'black';
            try {
                if (isNaN(parseInt(img.charAt(0)))) {
                    color = '#404040';
                }
            } catch (e) {
            }
            return color;
        }

        /!*
            // Reparto inicial de cartas
            dealAction() {
                this.loading = true;
                this.apiMonopolyService.postInitialDeal().subscribe({
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
            }*!/


        // Proceso una respuesta con los datos del game
        /!* private saveGameData(response: any) {
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
         }*!/

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

        delay(milliseconds: number) {
            return new Promise(resolve => {
                setTimeout(resolve, milliseconds);
            });
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
        }*/


}

@Component({
    selector: 'confirm-monopoly-dialog',
    templateUrl: 'confirm-monopoly-dialog.html'
})
export class ConfirmMonopolyDialog {
}


@Component({
    selector: 'fullview-monopoly-dialog',
    templateUrl: 'fullview-monopoly-dialog.html'
})
export class FullViewMonopolyDialog {
    theImg;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private domSanitizer: DomSanitizer) {
        this.theImg = this.domSanitizer.bypassSecurityTrustResourceUrl(data.source);
    }
}

@Component({
    selector: 'fullviewvideo-monopoly-dialog',
    templateUrl: 'fullviewvideo-monopoly-dialog.html'
})
export class FullViewVideoMonopolyDialog {
    theVid;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private domSanitizer: DomSanitizer) {
        this.theVid = this.domSanitizer.bypassSecurityTrustResourceUrl(data.source);
    }
}
