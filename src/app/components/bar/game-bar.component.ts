import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {DomSanitizer} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {ApiBarService} from '../../services/api-bar.service';

const maxChats = 12;
const chatDelay = 500;

@Component({
    selector: 'app-game-bar',
    templateUrl: './game-bar.component.html',
    styleUrls: ['./game-bar.component.scss']
})
export class GameBarComponent implements OnInit {
    market: any = [];
    game: any = null;
    loading = false;
    previewCard: any = null;

    playersInRestroom: any = [];

    ///////
    you: any = {};
    currentImgs: any = {};
    chats: any[] = [];
    endGame = false;
    winnerYou = false;
    message = '';

    constructor(private apiBarService: ApiBarService, private toast: ToastrService, private router: Router, public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.refresh();
        this.previewCard = {};
    }

    refresh() {
        this.loading = true;
        this.apiBarService.getGame().subscribe({
            next: (response: any) => {
                this.processGameData(response);
                this.loading = false;

                this.nextTurn();
            },
            error: (err: Error) => console.error('Error getting game data: ' + err)
        });
    }

    processGameData(response: any) {
        this.game = response.data;
        this.market = response.data.market;
        this.playersInRestroom = this.playersInRestroom.concat(response.data.house.restroom.players);
        console.log(this.game);
    }

    openMarket() {
        const dialogRef = this.dialog.open(MarketBarDialog, {
            width: '90vw',
            height: '90vh',
            data: {url: 'http://localhost:7777/players/'}
        });

        dialogRef.componentInstance.messageEvent.subscribe((playerId) => {
            this.buyPlayer(playerId);
        });
    }

    buyPlayer(playerId: any) {
        this.apiBarService.postBuyPlayer(playerId).subscribe({
            next: (response: any) => {
                this.processGameData(response);
            },
            error: (err: Error) => console.error('Error getting game data: ' + err)
        });
    }


    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////

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
        const max = this.market[pId]['imagesSet'][this.market[pId]['currentStage']].length - 1;
        // Rotamos imgs
        if (this.currentImgs[this.market[pId]['name']] === undefined) {
            this.currentImgs[this.market[pId]['name']] = 0;
        } else {
            this.currentImgs[this.market[pId]['name']]++;
        }

        if (this.currentImgs[this.market[pId]['name']] > max) {
            this.currentImgs[this.market[pId]['name']] = 0;
        }
    }

    getImg(pId: any, urlWrap: boolean = true) {
        if (!this.market[pId]) return '';

        let cStage = '';
        // console.log(JSON.stringify(rival));
        switch (this.market[pId]['corruption']) {
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
            console.debug('cStage undefined ' + this.market[pId].name);
        }
        // console.log(JSON.stringify(rival));
        // Rotamos imgs
        if (this.currentImgs[this.market[pId]['name']] === undefined) {
            this.currentImgs[this.market[pId]['name']] = Math.floor(Math.random() * this.market[pId]['imagesSet'][cStage].length);
        }
        // console.log(rival);
        const theImg = this.market[pId]['imagesSet'][cStage][this.currentImgs[this.market[pId]['name']]];
        if (theImg === undefined) {
            console.debug('IMG undefined:');
            console.debug(this.market[pId]);
            console.debug(this.currentImgs);
        }
        if (urlWrap) {
            return 'url("http://localhost:7777/players/' + this.market[pId]['name'] + '/' + theImg + '")';
        } else {
            return 'http://localhost:7777/players/' + this.market[pId]['name'] + '/' + theImg;
        }
    }

    getCardImg(card: any, forDomImg: boolean = false) {
        console.log('ppp ' + JSON.stringify(card));
        if (card) {
            let extras = '';
            if (card.type === 'character') {
                extras = card.charLevel;
            }

            if (!forDomImg) {
                return 'url("http://localhost:7777/bar/' + card.type + '/' + card.image + extras + '.jpg")';
            } else {
                return 'http://localhost:7777/bar/' + card.type + '/' + card.image + extras + '.jpg';
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

            return 'http://localhost:7777/bar/' + this.previewCard['type'] + '/' + this.previewCard['image'] + extras + '.jpg';
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
        if (!this.market[pId]) return false;
        return this.market[pId] && this.game.currentPlayerId === this.market[pId].id;
    }

    getPlayerName(pId: number) {
        if (!this.market[pId]) return '';
        return this.market[pId].name;
    }

    getPlayerHealth(pId: number) {
        if (!this.market[pId]) return 0;
        console.log('corru ' + (7 - this.market[pId].corruption) * 100 / 7);
        return (7 - this.market[pId].corruption) * 100 / 7;
    }

    getPlayerHealthColor(pId: number) {
        if (!this.market[pId]) return '#666';
        console.log(JSON.stringify(this.market[pId]));
        let color;
        switch (7 - this.market[pId].corruption) {
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
        this.dialog.open(FullViewBarDialog, {
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
        let videoUrl = 'http://localhost:7777/api/b/video/' + rival['name'] + '/' + cat;
        this.dialog.open(FullViewVideoBarDialog, {
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
        const dialogRef = this.dialog.open(ConfirmBarDialog);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.newGame();
            }
        });
    }

}

@Component({
    selector: 'confirm-bar-dialog',
    templateUrl: 'confirm-bar-dialog.html'
})
export class ConfirmBarDialog {
}


@Component({
    selector: 'fullview-bar-dialog',
    templateUrl: 'fullview-bar-dialog.html'
})
export class FullViewBarDialog {
    theImg;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private domSanitizer: DomSanitizer) {
        this.theImg = this.domSanitizer.bypassSecurityTrustResourceUrl(data.source);
    }
}

@Component({
    selector: 'fullviewvideo-bar-dialog',
    templateUrl: 'fullviewvideo-bar-dialog.html'
})
export class FullViewVideoBarDialog {
    theVid;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private domSanitizer: DomSanitizer) {
        this.theVid = this.domSanitizer.bypassSecurityTrustResourceUrl(data.source);
    }
}


@Component({
    selector: 'market-bar-dialog',
    templateUrl: 'market-bar-dialog.html',
    styleUrls: ['./market-bar-dialog.scss']
})
export class MarketBarDialog implements OnInit {
    players: any;
    imgRoute;
    money: any;
    messageEvent = new EventEmitter<string>();

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private apiBarService: ApiBarService) {
        this.imgRoute = data.url;
    }

    ngOnInit(): void {
        this.getPlayerList();
    }

    buy(playerId: any) {
        this.messageEvent.emit(playerId);
        setTimeout(() => {
            this.getPlayerList()
        }, 500);
    }

    getPlayerList() {
        this.apiBarService.getGame().subscribe({
            next: (response: any) => {
                this.players = response.data.market;
                this.money = response.data.money;
            },
            error: (err: Error) => console.error('Error getting game data: ' + err)
        });
    }
}
