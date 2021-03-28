import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//import generated components
import { HomeComponent } from "./home/home.component";
import { SignupComponent } from "./users/signup/signup.component";
import { LoginComponent } from "./users/login/login.component";
import { UpdateComponent} from "./users/update/update.component";
import { AddComponent } from "./books/add/add.component";
import { BookUpdateComponent } from "./books/update/update.component";
import { IndexComponent } from "./books/index/index.component";
import { ResetComponent } from "./users/reset/reset.component";


const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'update',
        component: UpdateComponent
    },
    {
        path: 'reset',
        component: ResetComponent
    },
    {
        path: 'books/add',
        component: AddComponent
    },
    {
        path: 'book/update/:id',
        component: BookUpdateComponent
    },
    {
        path: 'books/index',
        component: IndexComponent
    }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
