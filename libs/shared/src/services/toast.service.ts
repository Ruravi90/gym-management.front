import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
export interface Toast { message: string; type: 'success' | 'error' | 'info'; }
@Injectable({ providedIn: 'root' })
export class ToastService { private subject = new Subject<Toast>(); toast$ = this.subject.asObservable(); show(message: string, type: Toast['type'] = 'info'): void { this.subject.next({ message, type }); } }
