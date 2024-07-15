import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'map-frontend-app';
  isClicked: boolean = false;

  handleClick() {
    this.isClicked = true; // Assuming reference to AppComponent
    // (Optional) Add sound effect or visual cue for click
  }
}
