import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GameComponent} from './components/game/game.component';
import {GameMonopolyComponent} from './components/monopoly/game-monopoly.component';
import {GameAnimaComponent} from "./components/anima/game-anima.component";
import {SelectPlayerComponent} from './components/select-player/select-player.component';
import {UploadComponent} from './components/upload/upload.component';

const routes: Routes = [
    {path: '', component: SelectPlayerComponent},
    {path: 'game', component: GameComponent},
    {path: 'monopoly', component: GameMonopolyComponent},
    {path: 'anima', component: GameAnimaComponent},
    {path: 'upload', component: UploadComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
