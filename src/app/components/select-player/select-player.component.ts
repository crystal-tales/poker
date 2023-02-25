import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiMonopolyService } from '../../services/api-monopoly.service';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-select-player',
    templateUrl: './select-player.component.html',
    styleUrls: ['./select-player.component.scss']
})
export class SelectPlayerComponent implements OnInit {
    playerList = [];
    selectedPlayers: Array<string> = [];

    constructor(private apiService: ApiService, private apiMonopolyService: ApiMonopolyService, private router: Router) {
    }

    ngOnInit(): void {
        this.apiService.getAllPlayers().subscribe({
            next: (response: any) => this.playerList = response.players,
            error: (err: Error) => console.error('Error getting player list: ' + err)
        });
    }

    getImg(player: string) {
        return 'url("http://localhost:7777/players/' + player + '/s.jpg")';
    }

    startGame() {
        this.apiService.postStartGame(this.selectedPlayers).subscribe({
            next: (response) => {
                this.router.navigate(['/game']).catch(e => {console.error(e);});
            },
            error: (err: Error) => console.error('Error starting new game: ' + err)
        });
    }

    startMonopoly() {
        this.apiMonopolyService.postStartGame(this.selectedPlayers).subscribe({
            next: (response) => {
                this.router.navigate(['/monopoly']).catch(e => {console.error(e);});
            },
            error: (err: Error) => console.error('Error starting new monopoly: ' + err)
        });
    }

    selected(player: string) {
        return this.selectedPlayers.includes(player);
    }

    select(player: string) {
        if (!this.selectedPlayers.includes(player)) {
            this.selectedPlayers.push(player);
            if (this.selectedPlayers.length > 4) {
                this.selectedPlayers.shift();
            }
        } else {
            const idx = this.selectedPlayers.indexOf(player);
            this.selectedPlayers.splice(idx, 1);
        }
    }

    random() {
        // ELijo 4 aleatorios sin repetir
        this.selectedPlayers = [];
        let chosen = new Set<number>();
        while (chosen.size < 4) {
            const rand = Math.floor(Math.random() * (this.playerList.length - 1)) + 1;
            chosen.add(rand);
        }
        chosen.forEach((c: number) => {
            this.selectedPlayers.push(this.playerList[c]);
        });
    }

    uploadImages() {
        this.router.navigate(['/upload']).catch(e => {console.error(e);});
    }
}
