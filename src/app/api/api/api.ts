export * from './authenticationController.service';
import { AuthenticationControllerService } from './authenticationController.service';
export * from './eventoController.service';
import { EventoControllerService } from './eventoController.service';
export const APIS = [AuthenticationControllerService, EventoControllerService];
