import {DragDropModule} from '@angular/cdk/drag-drop';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DragDropDirective} from './components/drag-drop.directive';
import {ConfirmDialog, FullViewDialog, GameComponent} from './components/game/game.component';
import {
    ConfirmMonopolyDialog,
    FullViewMonopolyDialog,
    FullViewVideoMonopolyDialog,
    GameMonopolyComponent
} from './components/monopoly/game-monopoly.component';
import {SelectPlayerComponent} from './components/select-player/select-player.component';
import {UploadComponent} from './components/upload/upload.component';
import {SortHandPipe} from './services/sort-hand.pipe';
import {
    ConfirmAnimaDialog,
    FullViewAnimaDialog,
    FullViewVideoAnimaDialog,
    GameAnimaComponent
} from "./components/anima/game-anima.component";
import {MatProgressBarModule} from "@angular/material/progress-bar";

@NgModule({
    declarations: [
        AppComponent,
        SelectPlayerComponent,
        GameComponent,
        SortHandPipe,
        UploadComponent,
        DragDropDirective,
        ConfirmDialog,
        FullViewDialog,
        ConfirmMonopolyDialog,
        FullViewMonopolyDialog,
        FullViewVideoMonopolyDialog,
        GameMonopolyComponent,
        ConfirmAnimaDialog,
        FullViewAnimaDialog,
        FullViewVideoAnimaDialog,
        GameAnimaComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        MatGridListModule,
        HttpClientModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule,
        MatBadgeModule,
        MatSnackBarModule,
        MatTooltipModule,
        DragDropModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatDialogModule,
        MatProgressBarModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
