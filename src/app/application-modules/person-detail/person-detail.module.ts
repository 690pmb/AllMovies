import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import {PersonDetailComponent} from './component/person-detail.component';
import {SharedModule} from '../../shared/shared.module';
import {BackButtonGuard} from '../../back-button.guard';

const childRoutes: Routes = [
  {
    path: ':id',
    component: PersonDetailComponent,
    canDeactivate: [BackButtonGuard],
    runGuardsAndResolvers: 'pathParamsChange',
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    MatButtonToggleModule,
    SharedModule.forChild(),
    RouterModule.forChild(childRoutes),
  ],
  declarations: [PersonDetailComponent],
  providers: [],
})
export class PersonDetailModule {}
