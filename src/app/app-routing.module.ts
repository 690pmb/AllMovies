import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGard} from './app.gards';

const routes: Routes = [
  {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./application-modules/dashboard/dashboard.module').then(
        m => m.DashboardModule
      ),
  },
  {
    path: 'movie',
    loadChildren: () =>
      import('./application-modules/movie-detail/movie-detail.module').then(
        m => m.MovieDetailModule
      ),
  },
  {
    path: 'serie',
    loadChildren: () =>
      import('./application-modules/serie-detail/serie-detail.module').then(
        m => m.SerieDetailModule
      ),
  },
  {
    path: 'person',
    loadChildren: () =>
      import('./application-modules/person-detail/person-detail.module').then(
        m => m.PersonDetailModule
      ),
  },
  {
    path: 'release',
    loadChildren: () =>
      import('./application-modules/release/release.module').then(
        m => m.ReleaseModule
      ),
  },
  {
    path: 'datas',
    loadChildren: () =>
      import('./application-modules/datas/datas.module').then(
        m => m.DatasModule
      ),
    canActivate: [AuthGard],
  },
  {
    path: 'discover',
    loadChildren: () =>
      import('./application-modules/discover/discover.module').then(
        m => m.DiscoverModule
      ),
  },
  {
    path: 'tags',
    loadChildren: () =>
      import('./application-modules/tags/tags.module').then(m => m.TagsModule),
    canActivate: [AuthGard],
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./application-modules/login/login.module').then(
        m => m.LoginModule
      ),
  },
  {path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
