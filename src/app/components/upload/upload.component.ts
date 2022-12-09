import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { FileHandle } from '../drag-drop.directive';

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
    files: FileHandle[] = [];
    name = '';
    portrait: FileHandle[] = [];
    back: FileHandle[] = [];
    stage0: FileHandle[] = [];
    stage1: FileHandle[] = [];
    stage2: FileHandle[] = [];
    stage3: FileHandle[] = [];
    stage4: FileHandle[] = [];
    stage5: FileHandle[] = [];

    constructor(private apiService: ApiService, private toast: ToastrService, private router: Router) {
    }

    drop(event: CdkDragDrop<any>) {
        console.log(event.previousContainer);
        console.log(event.container);
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        }
    }

    filesDropped(files: FileHandle[]): void {
        console.log(files);
        this.back = this.back.concat(files);
    }

    upload(): void {
        let files: { '0': any[]; '1': any[]; '2': any[]; '3': any[]; '4': any[]; '5': any[]; portrait: any };
        files = {portrait: null, 5: this.stage5, 4: this.stage4, 3: this.stage3, 2: this.stage2, 1: this.stage1, 0: this.stage0};
        if (this.portrait.length > 0) {
            files.portrait = this.portrait[0];
        }
        this.apiService.postNewRival({name: this.name}, files).subscribe({
            next: (response: any) => {
                this.toast.success(response.data, 'Success');
                this.backNav();
            },
            error: (err: Error) => console.error('Error creating rival: ' + err)
        });
    }

    backNav() {
        this.router.navigate(['/']).catch(e => {console.error(e);});
    }

    checkDisabled() {
        return this.stage5.length === 0 || this.stage4.length === 0 || this.stage3.length === 0 || this.stage2.length === 0 || this.stage1.length === 0 || this.stage0.length === 0 || this.name === '' || this.portrait.length > 1;

    }

    alphaNumberOnly(e: any) {
        const regex = new RegExp('^[a-zA-Z0-9 ]+$');
        const str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (regex.test(str)) {
            return true;
        }

        e.preventDefault();
        return false;
    }

    onPaste(e: any) {
        e.preventDefault();
        return false;
    }
}
