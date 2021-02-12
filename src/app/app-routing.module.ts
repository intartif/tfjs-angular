import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrainerImgDniComponent } from './components/trainer-img-dni/trainer-img-dni.component';


const routes: Routes = [
  { path: 'train', component: TrainerImgDniComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'home'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
