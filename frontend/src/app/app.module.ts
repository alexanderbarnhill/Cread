import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatTabsModule} from "@angular/material/tabs";
import {ChatWindowComponent } from './chat-window/chat-window.component';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatListModule} from "@angular/material/list";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDialogModule} from "@angular/material/dialog";
import {UserInfoDialog} from "../dialogs/user-info-dialog";
import {FormsModule} from "@angular/forms";
import {NewChatDialog} from "../dialogs/new-chat-dialog";
import {MatMenuModule} from "@angular/material/menu";
import {MatToolbarModule} from "@angular/material/toolbar";

@NgModule({
  declarations: [
    AppComponent,
    ChatWindowComponent,
    UserInfoDialog,
    NewChatDialog,
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatSidenavModule,
        MatTabsModule,
        MatIconModule,
        MatButtonModule,
        MatGridListModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        FormsModule,
        MatMenuModule,
        MatToolbarModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
