import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

export const MAPBOX_TOKEN = 'pk.eyJ1IjoicGllcnJlLW5lcmQiLCJhIjoiY21pZ21hZ25xMDg0aTNqb282a2hyZXhrbyJ9.AsHShbMNmtjH9HjwAuUbSw';

const providers = [
  { provide: 'MAPBOX_TOKEN', useValue: MAPBOX_TOKEN }
];

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    (appConfig.providers || []),
    providers
  ]
}).catch(err => console.error(err));
