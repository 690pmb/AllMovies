import {MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterModule} from '@angular/router';
import {SwiperModule, SWIPER_CONFIG} from 'ngx-swiper-wrapper';
import {PinchZoomModule} from 'ngx-pinch-zoom';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {
  MatDialogModule,
  MAT_DIALOG_DEFAULT_OPTIONS,
} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';

import {MetaComponent} from './components/meta/component/meta.component';
import {GoToTopComponent} from './components/go-to-top/go-to-top.component';
import {ListPersonsComponent} from './components/list-persons/list-persons.component';
import {ScoreComponent} from './components/score/score.component';
import {ListDatasComponent} from './components/list-datas/list-datas.component';
import {AddCollectionDirective} from './directives/add-collection.directive';
import {ImageViewerComponent} from './components/image-viewer/image-viewer.component';
import {DropdownLanguageComponent} from './components/dropdown-language/dropdown-language.component';
import {TabsComponent} from './components/tabs/tabs.component';
import {FilterCrewPipe} from './pipes/filterCrew.pipe';
import {CapitalizeWordPipe} from './pipes/capitalizeWord.pipe';
import {MenuComponent} from './components/menu/menu.component';
import {SubstractDatePipe} from './pipes/substractDate.pipe';
import {ConvertToHHmmPipe} from './pipes/convertToHHmm.pipe';
import {ModalComponent} from './components/modal/modal.component';
import {MovieSearchComponent} from './components/movie-search/movie-search.component';
import {PersonSearchComponent} from './components/person-search/person-search.component';
import {OpenLinkDialogComponent} from './components/open-link-dialog/open-link-dialog.component';
import {OpenLinkDirective} from './directives/open-link.directive';
import {TruncatePipe} from './pipes/truncate.pipe';
import {SearchTagComponent} from './components/search-tag/search-tag.component';
import {ListTagsComponent} from './components/list-tags/list-tags.component';
import {ImagePipe} from './pipes/image.pipe';
import {SerieSearchComponent} from './components/serie-search/serie-search.component';
import {VideosComponent} from './components/videos/videos.component';
import {CreditListComponent} from './components/credit-list/credit-list.component';
import {BookmarkedComponent} from './components/bookmarked/bookmarked.component';
import {SearchBoxComponent} from './components/search-box/search-box.component';
import {ShareButtonComponent} from './components/share-button/share-button.component';
import {ClickOutsideDirective} from './directives/click-outside.directive';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    ConvertToHHmmPipe,
    SubstractDatePipe,
    CapitalizeWordPipe,
    ClickOutsideDirective,
    FilterCrewPipe,
    TruncatePipe,
    ImagePipe,
    VideosComponent,
    ListDatasComponent,
    MetaComponent,
    ListPersonsComponent,
    DropdownLanguageComponent,
    ScoreComponent,
    GoToTopComponent,
    AddCollectionDirective,
    ListTagsComponent,
    ModalComponent,
    SearchBoxComponent,
    SerieSearchComponent,
    MovieSearchComponent,
    OpenLinkDirective,
    SearchTagComponent,
    CreditListComponent,
    PersonSearchComponent,
    OpenLinkDialogComponent,
    MenuComponent,
    TabsComponent,
    ImageViewerComponent,
    BookmarkedComponent,
    ShareButtonComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    FontAwesomeModule,
    MatSidenavModule,
    MatTableModule,
    MatToolbarModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatListModule,
    MatButtonModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatChipsModule,
    MatIconModule,
    SwiperModule,
    MatDialogModule,
    PinchZoomModule,
    MatTabsModule,
    NgbModule,
    TranslateModule,
    MatTooltipModule,
    RouterModule.forChild([]),
  ],
  exports: [
    TranslateModule,
    ConvertToHHmmPipe,
    SubstractDatePipe,
    TruncatePipe,
    CapitalizeWordPipe,
    FilterCrewPipe,
    ImagePipe,
    GoToTopComponent,
    ListDatasComponent,
    VideosComponent,
    MetaComponent,
    CreditListComponent,
    OpenLinkDirective,
    SearchTagComponent,
    ListPersonsComponent,
    DropdownLanguageComponent,
    ListTagsComponent,
    AddCollectionDirective,
    TabsComponent,
    ScoreComponent,
    NgbModule,
    MatTooltipModule,
    MatStepperModule,
    ModalComponent,
    MovieSearchComponent,
    PersonSearchComponent,
    ImageViewerComponent,
    MenuComponent,
    SwiperModule,
    BookmarkedComponent,
    SearchBoxComponent,
    ShareButtonComponent,
  ],
})
export class SharedModule {
  constructor() {}

  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        {
          provide: MAT_DIALOG_DEFAULT_OPTIONS,
          useValue: {hasBackdrop: false, closeOnNavigation: true},
        },
        CapitalizeWordPipe,
        DatePipe,
        ImagePipe,
        {
          provide: SWIPER_CONFIG,
          useValue: {},
        },
      ],
    };
  }

  static forChild(): ModuleWithProviders<SharedModule> {
    return {ngModule: SharedModule};
  }
}
