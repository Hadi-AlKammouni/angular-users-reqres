import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HeaderComponent } from './shared/components/header/header.component';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, MatProgressBarModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  loadingService = inject(LoadingService);
}
