import {
  APP_BASE_HREF,
  CommonModule,
  PlatformLocation,
  registerLocaleData,
} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import {NgModule, ErrorHandler, APP_INITIALIZER} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {
  HttpClientModule,
  HttpClientJsonpModule,
  HttpClient,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  MissingTranslationHandler,
} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import 'bootstrap';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import {SharedModule} from './shared/shared.module';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {GlobalErrorHandler} from './service/global-error-handler';
import {ServerErrorInterceptor} from './service/server-error.interceptor';
import {MyMissingTranslationHandler} from './shared/my-missing-translation-handler';
import {Observable} from 'rxjs';

@NgModule({
  imports: [
    NgbModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    CommonModule,
    SharedModule.forRoot(),
    MatSnackBarModule,
    TranslateModule.forRoot({
      useDefaultLang: false,
      defaultLanguage: 'en',
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MyMissingTranslationHandler,
      },
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient): TranslateHttpLoader =>
          new TranslateHttpLoader(http, 'assets/i18n/', '.json'),
        deps: [HttpClient],
      },
    }),
    AppRoutingModule,
  ],
  declarations: [AppComponent],
  providers: [
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    {provide: HTTP_INTERCEPTORS, useClass: ServerErrorInterceptor, multi: true},
    {
      provide: APP_INITIALIZER,
      useFactory:
        (translate: TranslateService): (() => Observable<any>) =>
        () =>
          translate.use(translate.getBrowserLang()),
      deps: [TranslateService],
      multi: true,
    },
    {
      provide: APP_BASE_HREF,
      useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
      deps: [PlatformLocation],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    registerLocaleData(localeFr);
    registerLocaleData(localeEn);
  }
}
