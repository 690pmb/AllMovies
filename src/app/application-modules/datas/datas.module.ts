import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {LayoutModule} from '@angular/cdk/layout';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NouisliderModule} from 'ng2-nouislider';

import {DatasResolver} from './resolver/datas.resolver';
import {SharedModule} from '../../shared/shared.module';
import {DatasComponent} from './component/datas/datas.component';

const childRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'movies',
        component: DatasComponent,
        data: {isMovie: true},
        runGuardsAndResolvers: 'always',
        resolve: {dataList: DatasResolver},
      },
      {
        path: 'series',
        component: DatasComponent,
        data: {isMovie: false},
        runGuardsAndResolvers: 'always',
        resolve: {dataList: DatasResolver},
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(childRoutes),
    SharedModule.forChild(),
    FontAwesomeModule,
    MatTableModule,
    NouisliderModule,
    LayoutModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  declarations: [DatasComponent],
})
export class DatasModule {}
