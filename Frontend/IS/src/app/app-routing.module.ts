import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  { path: 'admin', component: AdminComponent,canActivate: [AuthGuard] },
  { path: '**', component: ChatbotComponent },
  // { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
