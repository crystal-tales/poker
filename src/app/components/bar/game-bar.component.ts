import {Component, EventEmitter, Inject, Input, OnInit} from '@angular/core';
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
    previewPlayer: any = null;
    previewRotation: number = 0;
    paused = false;

    playersInRestroom: any = [];
    playersInBar: any = [];
    playersInStage: any = [];
    playersInPrivate: any = [];
    playersInBedroom: any = [];
    playersInSchool: any = [];
    playersInDungeon: any = [];

    clientsInBar: any = [];
    clientsInStage: any = [];
    clientsInPrivate: any = [];
    clientsInBedroom: any = [];

    ///////
    you: any = {};
    currentImgs: any = {};
    chats: any[] = [];
    endGame = false;
    winnerYou = false;
    message = '';
    roomNumber = 0;

    constructor(private apiBarService: ApiBarService, private toast: ToastrService, private router: Router, public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.refresh();
        this.previewPlayer = {};

        setInterval(() => {
            this.nextHour();
        }, 5000);
    }

    refresh() {
        this.loading = true;
        this.apiBarService.getGame().subscribe({
            next: (response: any) => {
                this.processGameData(response);
                this.loading = false;
            },
            error: (err: Error) => console.error('Error getting game data: ' + err)
        });
    }

    processGameData(response: any) {
        this.game = response.data;
        this.market = response.data.market;
        //players
        this.playersInRestroom = response.data.house.restroom.players;
        this.playersInBar = response.data.house.bar.players;
        this.playersInStage = response.data.house.stage.players;
        this.playersInPrivate = response.data.house.private.players;
        this.playersInBedroom = response.data.house.bedroom.players;
        this.playersInSchool = response.data.house.school.players;
        this.playersInDungeon = response.data.house.dungeon.players;
        //clients
        this.clientsInBar = response.data.house.bar.clients;
        this.clientsInStage = response.data.house.stage.clients;
        this.clientsInPrivate = response.data.house.private.clients;
        this.clientsInBedroom = response.data.house.bedroom.clients;

        console.log('GAME');
        console.log(this.game);
    }

    nextHour() {
        // If not paused apply next tick
        if (!this.paused) {
            this.apiBarService.getNextHour().subscribe({
                next: (response: any) => {
                    this.processGameData(response);
                },
                error: (err: Error) => console.error('Error getting game next hour: ' + err)
            });
        }
    }

    resumeOrPause() {
        this.paused = !this.paused;
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

    setPreviewImg(player: any, room: number) {
        let isNew = false;
        if (!this.previewPlayer['id'] || this.previewPlayer['id'] !== player['id']) {
            isNew = true;
        }
        this.previewPlayer = player;

        if (isNew) {
            this.previewRotation = 0;
        } else {
            this.rotatePreviewImg();
        }

        this.roomNumber = room;
        console.log('+++++++++');
        console.log(this.previewPlayer);
        console.log('rotation: ' + this.previewRotation);
        console.log('-----------');
    }

    getPreviewImg() {
        if (this.previewPlayer && this.previewPlayer['images']) {
            // TODO elegir stage de imagen

            return 'http://localhost:7777/players/' + this.previewPlayer['id'] + '/' + this.previewPlayer['images'][this.previewPlayer['selectedSet']][0][this.previewRotation];
        }
        return '';
    }

    rotatePreviewImg() {
        if (this.previewPlayer['images'][this.previewPlayer['selectedSet']][this.roomNumber].length <= this.previewRotation + 1) {
            this.previewRotation = 0;
        } else {
            this.previewRotation++;
        }
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

    /*

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
        }*/

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
    selector: 'person-card',
    templateUrl: 'person-card.html',
    styleUrls: ['./person-card.scss']
})
export class PersonCard {
    @Input() person: any;
    @Input() type: any;

    constructor() {
    }

    getMood(mood: any) {
        let sentiment = '', color = '', text = '';
        if (mood > 80) {
            sentiment = 'sentiment_very_satisfied';
            color = '#27e100'
            text = 'Happy';
        }
        if (mood <= 80 && mood > 60) {
            sentiment = 'sentiment_satisfied';
            color = '#008af3'
            text = 'Satisfied';
        }
        if (mood <= 60 && mood > 40) {
            sentiment = 'sentiment_neutral';
            color = '#ffdd00'
            text = 'Normal';
        }
        if (mood < 40 && mood > 20) {
            sentiment = 'sentiment_dissatisfied';
            color = '#de7100'
            text = 'Sad';
        }
        if (mood < 20) {
            sentiment = 'sentiment_very_dissatisfied';
            color = '#e70000'
            text = 'Angry';
        }
        return {sentiment, color, text};
    }

    getStamina(stamina: any) {
        let color = '', text = '';
        if (stamina > 60) {
            color = '#27e100'
            text = 'Rested';
        }
        if (stamina <= 60 && stamina > 30) {
            color = '#ffdd00'
            text = 'Tired';
        }
        if (stamina < 30) {
            color = '#e70000'
            text = 'Exhausted';
        }
        return {color, text};
    }

    getWait(wait: any) {
        let color = '',
            value = wait * 2 * 10;
        if (wait > 1) {
            color = '#27e100'
        }
        if (wait <= 1) {
            color = '#e70000'
        }
        return {color, value};
    }

    getClientTooltip(client: any) {
        let txt = [];
        txt.push(client.name);

        let etniaT = '', ageT = '', sexT = '', titsT = '';
        switch (client.prefs.sex) {
            case 1:
                sexT = 'females';
                break;
            case 2:
                sexT = 'futas';
                break;
        }
        switch (client.prefs.races) {
            case 1:
                etniaT = 'white';
                break;
            case 2:
                etniaT = 'asian';
                break;
            case 3:
                etniaT = 'black';
                break;
        }
        switch (client.prefs.tits) {
            case 1:
                titsT = 'small';
                break;
            case 2:
                titsT = 'normal';
                break;
            case 3:
                titsT = 'big';
                break;
            case 4:
                titsT = 'massive';
                break;
        }
        switch (client.prefs.age) {
            case 1:
                ageT = 'teens';
                break;
            case 2:
                ageT = 'youngs';
                break;
            case 3:
                ageT = 'milfs';
                break;
        }
        txt.push('Loves ' + etniaT + ' ' + ageT + ' ' + sexT + ' with ' + titsT + ' tits');

        let prefs: any = [[], [], [], [], [], []];
        Object.keys(client.prefs).forEach((pf) => {
            if (!(['age', 'sex', 'tits', 'etnia'].includes(pf))) {
                prefs[client.prefs[pf]].push(pf);
            }
        });
        txt.push('Crazy about: ' + prefs[5].join(', '));
        txt.push('Also likes: ' + prefs[4].join(', '));

        return txt;
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
    buying: boolean = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private apiBarService: ApiBarService) {
        this.imgRoute = data.url;
    }

    ngOnInit(): void {
        this.getPlayerList();
    }

    buy(playerId: any) {
        this.buying = true;
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
                this.buying = false;
            },
            error: (err: Error) => console.error('Error getting game data: ' + err)
        });
    }
}
