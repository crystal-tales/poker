import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameAnimaComponent} from './game-anima.component';

describe('GameComponent', () => {
    let component: GameAnimaComponent;
    let fixture: ComponentFixture<GameAnimaComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameAnimaComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(GameAnimaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
