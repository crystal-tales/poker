import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameBarComponent} from './game-bar.component';

describe('GameComponent', () => {
    let component: GameBarComponent;
    let fixture: ComponentFixture<GameBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameBarComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(GameBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
