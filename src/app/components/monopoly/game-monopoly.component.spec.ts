import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameMonopolyComponent } from './game-monopoly.component';

describe('GameComponent', () => {
    let component: GameMonopolyComponent;
    let fixture: ComponentFixture<GameMonopolyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameMonopolyComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(GameMonopolyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
