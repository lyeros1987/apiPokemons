import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PokemonListComponent } from './componentes/pokemon/pokemon-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import {TableModule} from 'primeng/table';
import { HeaderComponent } from './componentes/header/header.component';
import { PokemonDetailComponent } from './componentes/pokemon-detail/pokemon-detail.component';
import { PokemonSummaryComponent } from './componentes/pokemon-summary/pokemon-summary.component';
import { FavoritesComponent } from './componentes/favorites/favorites.component';



import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {PanelModule } from 'primeng/panel';
import { PokemonImagePipe } from './pipes/pokemon-image.pipe';
import { summaryReducer } from './store/models/summary.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';


@NgModule({
  declarations: [
    AppComponent,
    PokemonListComponent,
    HeaderComponent,
    PokemonDetailComponent,
    PokemonSummaryComponent,
    FavoritesComponent,
    PokemonImagePipe,
 
    
  ],
  imports: [
     StoreModule.forRoot({ summary: summaryReducer }),
      StoreDevtoolsModule.instrument({ maxAge: 25 }),
   
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterLink,FormsModule,ReactiveFormsModule,TableModule,CardModule,ButtonModule,PanelModule,DialogModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
