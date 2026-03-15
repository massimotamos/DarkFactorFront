import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { WorkflowEditorComponent } from './components/workflow-editor/workflow-editor.component';

@NgModule({
  declarations: [AppComponent, WorkflowEditorComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
