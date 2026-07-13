import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import * as crypto from 'crypto-js';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

import {User} from './../../../model/user';
import {AuthService} from '../../../service/auth.service';
import {UtilsService} from '../../../service/utils.service';
import {TitleService} from '../../../service/title.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss'],
})
export class ForgotComponent implements OnInit, OnDestroy {
  @ViewChild('nameNext', {static: true}) nameNext!: ElementRef;
  @ViewChild('answerNext', {static: true}) answerNext!: ElementRef;
  @ViewChild('passwordNext', {static: true}) passwordNext!: ElementRef;
  question?: string;
  answer!: string;
  name!: string;
  messageName?: string;
  messageAnswer?: string;
  messagePassword!: string;
  password1!: string;
  password2!: string;
  user?: User;
  subs: Subscription[] = [];
  faCheck = faCheck;

  constructor(
    private auth: AuthService,
    private serviceUtils: UtilsService,
    private route: ActivatedRoute,
    private title: TitleService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('title.login');
    this.subs.push(
      this.route.queryParams.subscribe(params => {
        this.name = params.name ? params.name : '';
      })
    );
  }

  loadQuestion(): void {
    this.question = '';
    this.auth.getUserByName(this.name).subscribe({
      next: user => {
        if (user) {
          this.question = user.question;
          this.nameNext.nativeElement.click();
          this.messageName = undefined;
          this.user = user;
        } else {
          this.messageName = 'login.forgot.wrong_name';
          this.user = undefined;
        }
      },
      error: err => this.serviceUtils.handleError(err),
    });
  }

  forgot(): void {
    this.messageAnswer = undefined;
    this.auth
      .checkAnswer(this.name, crypto.SHA512(this.answer).toString())
      .subscribe({
        next: correct => {
          if (correct) {
            this.answerNext.nativeElement.click();
          } else {
            this.messageAnswer = 'login.wrong_answer';
          }
        },
        error: err => this.serviceUtils.handleError(err),
      });
  }

  changePassword(): void {
    if (this.password1 !== this.password2) {
      this.messagePassword = 'login.error_password';
    } else if (this.user) {
      this.user.password = crypto.SHA512(this.password1).toString();
      this.auth.updateUser(this.user).subscribe();
      this.passwordNext.nativeElement.click();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(subscription => subscription.unsubscribe());
  }
}
