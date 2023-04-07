import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {DomSanitizer} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {ApiAnimaService} from '../../services/api-anima.service';

const maxChats = 12;
const chatDelay = 500;

@Component({
    selector: 'app-game-anima',
    templateUrl: './game-anima.component.html',
    styleUrls: ['./game-anima.component.scss']
})
export class GameAnimaComponent implements OnInit {
    players: any = [];
    you: any = {};
    game: any = {board: {cells: []}};
    previewCard: any = null;
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

    constructor(private apiAnimaService: ApiAnimaService, private toast: ToastrService, private router: Router, public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.refresh(true);
        this.previewCard = {type: 'general', image: 'backcard'};
    }

    refresh(first: boolean = false) {
        this.loading = true;
        this.apiAnimaService.getGame().subscribe({
            next: (response: any) => {
                this.game = response.data;
                this.players = this.game.players;
                this.game.players = undefined;
                this.loading = false;

                console.log(this.game);
                console.log(this.players);

                /*if (response.data.final) {
                    this.endGame = response.data.final.endGame;
                    this.winnerYou = response.data.final.areYouWinner;
                }*/
                this.nextTurn();
            },
            error: (err: Error) => console.error('Error getting game data: ' + err)
        });
    }

    nextTurn() {
        /*// Deselecciono
        this.selectedCell = {type: '', level: 1};
        this.message = '';

        if (this.firstTurn) {
            this.firstTurn = false;
            this.checkRivalsInCells();
            this.checkCounters();
            return;
        }

        this.apiAnimaService.getNewTurn().subscribe({
            next: (response: any) => {
                this.game = response.data.game;
                this.game.players = response.data.players;
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
        });*/
    }

    getRival(id: any) {
        /*let ret = null;
        this.game.players.forEach((rival: any) => {
            if (rival.name == id) {
                ret = rival;
            }
        });
        return ret;*/
    }

    checkRivalsInCells() {
        /*this.cellsRivals = {};
        this.game.players.forEach((rival: any) => {
            if (!this.cellsRivals[rival.currentCellId]) {
                this.cellsRivals[rival.currentCellId] = [];
            }
            this.cellsRivals[rival.currentCellId].push({color: rival.color, name: rival.name});
        });*/
    }

    changeImg(pId: any) {
        const max = this.players[pId]['imagesSet'][this.players[pId]['currentStage']].length - 1;
        // Rotamos imgs
        if (this.currentImgs[this.players[pId]['name']] === undefined) {
            this.currentImgs[this.players[pId]['name']] = 0;
        } else {
            this.currentImgs[this.players[pId]['name']]++;
        }

        if (this.currentImgs[this.players[pId]['name']] > max) {
            this.currentImgs[this.players[pId]['name']] = 0;
        }
    }

    getImg(pId: any, urlWrap: boolean = true) {
        if (!this.players[pId]) return '';

        let cStage = '';
        // console.log(JSON.stringify(rival));
        switch (this.players[pId]['corruption']) {
            case 0:
                cStage += 5;
                break;
            case 1:
                cStage += 4;
                break;
            case 2:
                cStage += 3;
                break;
            case 3:
                cStage += 2;
                break;
            case 4:
                cStage += 1;
                break;
            default:
                cStage += 0;
                break;
        }
        // console.log(cStage);
        if (cStage === '') {
            console.debug('cStage undefined ' + this.players[pId].name);
        }
        // console.log(JSON.stringify(rival));
        // Rotamos imgs
        if (this.currentImgs[this.players[pId]['name']] === undefined) {
            this.currentImgs[this.players[pId]['name']] = Math.floor(Math.random() * this.players[pId]['imagesSet'][cStage].length);
        }
        // console.log(rival);
        const theImg = this.players[pId]['imagesSet'][cStage][this.currentImgs[this.players[pId]['name']]];
        if (theImg === undefined) {
            console.debug('IMG undefined:');
            console.debug(this.players[pId]);
            console.debug(this.currentImgs);
        }
        if (urlWrap) {
            return 'url("http://localhost:7777/players/' + this.players[pId]['name'] + '/' + theImg + '")';
        } else {
            return 'http://localhost:7777/players/' + this.players[pId]['name'] + '/' + theImg;
        }
    }

    getCardImg(card: any, forDomImg: boolean = false) {
        // console.log('ppp ' + JSON.stringify(card));
        if (card) {
            let extras = '';
            if (card.type === 'character') {
                extras = card.charLevel;
            }

            if (!forDomImg) {
                return 'url("http://localhost:7777/anima/' + card.type + '/' + card.image + extras + '.jpg")';
            } else {
                return 'http://localhost:7777/anima/' + card.type + '/' + card.image + extras + '.jpg';
            }
        }
        return '';
    }

    getPreviewImg() {
        if (this.previewCard) {
            let extras = '';
            if (this.previewCard.type === 'character') {
                extras = this.previewCard.charLevel;
            }

            return 'http://localhost:7777/anima/' + this.previewCard['type'] + '/' + this.previewCard['image'] + extras + '.jpg';
        }
        return '';
    }

    hoverCard(card: any) {
        console.log(card);
        if (card) {
            this.previewCard = card;
        } else {
            this.previewCard = {type: 'general', image: 'backcard'};
        }
    }


    isActivePlayer(pId: number) {
        if (!this.players[pId]) return false;
        return this.players[pId] && this.game.currentPlayerId === this.players[pId].id;
    }

    getPlayerName(pId: number) {
        if (!this.players[pId]) return '';
        return this.players[pId].name;
    }

    getPlayerHealth(pId: number) {
        if (!this.players[pId]) return 0;
        console.log('corru ' + (7 - this.players[pId].corruption) * 100 / 7);
        return (7 - this.players[pId].corruption) * 100 / 7;
    }

    getPlayerHealthColor(pId: number) {
        if (!this.players[pId]) return '#666';
        console.log(JSON.stringify(this.players[pId]));
        let color;
        switch (7 - this.players[pId].corruption) {
            case 7:
            case 6:
                color = '#388e3c';
                break;
            case 5:
            case 4:
            case 3:
                color = '#d9940e';
                break;
            case 2:
            case 1:
                color = '#d32f2f';
                break;
            case 0:
                color = '#000'
                break;
        }
        console.log(color);
        return color;
    }


    fullViewImg(img: string) {
        this.dialog.open(FullViewAnimaDialog, {
            width: '90vw',
            height: '100vh',
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
        this.dialog.open(FullViewVideoAnimaDialog, {
            width: '90vw',
            height: '95vh',
            data: {
                source: videoUrl
            }
        });
        return false;
    }


    newGame() {
        this.router.navigate(['/']).catch(e => {
            console.error(e);
        });
    }

    return() {
        const dialogRef = this.dialog.open(ConfirmAnimaDialog);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.newGame();
            }
        });
    }

}

@Component({
    selector: 'confirm-anima-dialog',
    templateUrl: 'confirm-anima-dialog.html'
})
export class ConfirmAnimaDialog {
}


@Component({
    selector: 'fullview-anima-dialog',
    templateUrl: 'fullview-anima-dialog.html'
})
export class FullViewAnimaDialog {
    theImg;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private domSanitizer: DomSanitizer) {
        this.theImg = this.domSanitizer.bypassSecurityTrustResourceUrl(data.source);
    }
}

@Component({
    selector: 'fullviewvideo-anima-dialog',
    templateUrl: 'fullviewvideo-anima-dialog.html'
})
export class FullViewVideoAnimaDialog {
    theVid;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private domSanitizer: DomSanitizer) {
        this.theVid = this.domSanitizer.bypassSecurityTrustResourceUrl(data.source);
    }
}
