import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PokemonDetailComponent } from './componentes/pokemon-detail/pokemon-detail.component';
import { PokemonListComponent } from './componentes/pokemon/pokemon-list.component';
import { AppComponent } from './app.component';

const routes: Routes = [
{
    path: '',
    component: AppComponent,
    children: [
      { path: 'detail/:id', component: PokemonDetailComponent, outlet: 'detail' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  
 }
