import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from './../../shared/shared.module';
import {DashboardComponent} from './component/dashboard/dashboard.component';
import {SwiperModule} from 'swiper/angular';

const childRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SwiperModule,
    RouterModule.forChild(childRoutes),
    SharedModule.forChild(),
  ],
  declarations: [DashboardComponent],
  providers: [],
})
export class DashboardModule {}
