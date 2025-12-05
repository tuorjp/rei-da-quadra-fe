import {Component, Inject, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import {EventoControllerService} from '../../api/api/eventoController.service';
import {EventoResponseDTO} from '../../api/model/eventoResponseDTO';
import {LanguageService} from '../../services/language.service';
import {AuthService} from '../../services/auth.service';
import {InscricaoService} from '../../services/inscricao.service';
import {finalize} from 'rxjs';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import dayjs from 'dayjs';
import {EventInscriptionsComponent} from '../event-inscriptions/event-inscriptions.component';
import {LocationPickerDialogComponent} from '../location-picker-dialog/location-picker-dialog.component';
import {EventTeamsComponent} from '../event-teams/event-teams.component';
import {EventMatchesComponent} from '../event-matches/event-matches.component';
import {EventDashboardComponent} from '../event-dashboard/event-dashboard.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTabsModule,
    EventInscriptionsComponent,
    EventTeamsComponent,
    EventMatchesComponent,
    EventDashboardComponent,
  ],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.css'
})
export class EventDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private eventoService = inject(EventoControllerService);
  private authService = inject(AuthService);
  private inscricaoService = inject(InscricaoService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  public langService = inject(LanguageService);

  evento = signal<EventoResponseDTO | null>(null);
  isLoading = signal<boolean>(true);
  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isOrganizer = signal<boolean>(false);
  isParticipating = signal<boolean>(false);
  isJoining = signal<boolean>(false);
  currentUserEmail = signal<string>('');

  eventForm: FormGroup;

  constructor(@Inject('MAPBOX_TOKEN') private mapboxToken: string) {
    this.eventForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      local: ['', Validators.required],
      dataHorario: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Carregar perfil do usuário atual
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.currentUserEmail.set(profile.email || '');
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(+id);
    }

    this.route.queryParams.subscribe(params => {
      if (params['edit'] === 'true' && this.isOrganizer()) {
        this.isEditing.set(true);
      }
    });
  }

  loadEvent(id: number): void {
    this.isLoading.set(true);

    this.eventoService.buscarEvento(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (evento) => {
          this.evento.set(evento);
          this.populateForm(evento);
          this.checkUserRole(id);
        },
        error: (error) => {
          console.error('Erro ao carregar evento:', error);

          let errorMessage = this.langService.translate('event.load.error');

          if (error.status === 404) {
            errorMessage = 'Evento não encontrado ou você não tem permissão para visualizá-lo.';
          } else if (error.status === 403) {
            errorMessage = 'Você não tem permissão para acessar este evento.';
          }

          this.snackBar.open(
            errorMessage,
            'OK',
            {duration: 5000}
          );
          this.router.navigate(['/my-events']);
        }
      });
  }

  checkUserRole(eventoId: number): void {
    // Verificar se é o organizador
    this.authService.getProfile().subscribe({
      next: (profile) => {
        const isOrg = this.evento()?.usuarioLogin === profile.email;
        this.isOrganizer.set(isOrg);

        // Se não for organizador, verificar se já está inscrito
        if (!isOrg) {
          this.checkParticipation(eventoId);
        }
      }
    });
  }

  checkParticipation(eventoId: number): void {
    this.inscricaoService.listarInscricoes(eventoId).subscribe({
      next: (inscricoes) => {
        const userEmail = this.currentUserEmail();
        const isParticipant = inscricoes.some(i => i.jogadorEmail === userEmail);
        this.isParticipating.set(isParticipant);
      },
      error: () => {
        this.isParticipating.set(false);
      }
    });
  }

  onJoinEvent(): void {
    if (this.isJoining() || !this.evento()?.id) return;

    this.isJoining.set(true);

    const request = {
      jogadorEmail: this.currentUserEmail()
    };

    // Criar solicitação de participação (status PENDENTE)
    this.inscricaoService.adicionarInscricao(this.evento()!.id!, request)
      .pipe(finalize(() => this.isJoining.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open(
            'Solicitação de participação enviada! Aguarde a aprovação do organizador.',
            'OK',
            {duration: 5000}
          );
          // Não marca como participando ainda, pois está pendente
        },
        error: (error) => {
          console.error('Erro ao participar do evento:', error);

          // Se retornar 403, significa que o backend não permite
          if (error.status === 403) {
            this.snackBar.open(
              'Você não tem permissão para participar deste evento.',
              'OK',
              {duration: 5000}
            );
          } else {
            this.snackBar.open(
              error.error?.message || this.langService.translate('event.join.error'),
              'OK',
              {duration: 5000}
            );
          }
        }
      });
  }

  populateForm(evento: EventoResponseDTO): void {
    let dateTimeValue = '';
    const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (evento.dataHorario) {
      dateTimeValue = dayjs.utc(evento.dataHorario).tz(userZone).format("YYYY-MM-DDTHH:mm");
    }

    this.eventForm.patchValue({
      nome: evento.nome || '',
      local: evento.local || '',
      dataHorario: dateTimeValue
    });
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing() && this.evento()) {
      // Se cancelar edição, restaurar valores originais
      this.populateForm(this.evento()!);
    }
  }

  onSave(): void {
    if (this.eventForm.invalid || this.isSaving() || !this.evento()?.id) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const updates: { [key: string]: any } = {};

    if (this.eventForm.value.nome !== this.evento()?.nome) {
      updates['nome'] = this.eventForm.value.nome;
    }
    if (this.eventForm.value.local !== this.evento()?.local) {
      updates['local'] = this.eventForm.value.local;
    }

    const localDateTime = this.eventForm.value.dataHorario;
    if (localDateTime) {
      const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const parsed = dayjs.tz(localDateTime, "YYYY-MM-DDTHH:mm", userZone);
      const utcIso = parsed.utc().toISOString();

      if (utcIso !== this.evento()?.dataHorario) {
        updates['dataHorario'] = utcIso;
      }
    }

    if (Object.keys(updates).length === 0) {
      this.isEditing.set(false);
      this.isSaving.set(false);
      return;
    }

    this.eventoService.atualizarEventoParcial(this.evento()!.id!, updates)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (eventoAtualizado) => {
          this.evento.set(eventoAtualizado);
          this.isEditing.set(false);
          this.snackBar.open(
            this.langService.translate('event.updated.success'),
            'OK',
            {duration: 3000}
          );
        },
        error: (error) => {
          console.error('Erro ao atualizar evento:', error);
          this.snackBar.open(
            this.langService.translate('event.updated.error'),
            'OK',
            {duration: 5000}
          );
        }
      });
  }

  onDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.langService.translate('delete.event'),
        message: this.langService.translate('delete.event.confirm')
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && this.evento()?.id) {
        this.deleteEvent(this.evento()!.id!);
      }
    });
  }

  deleteEvent(id: number): void {
    this.eventoService.deletarEvento(id)
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.langService.translate('event.deleted.success'),
            'OK',
            {duration: 3000}
          );
          this.router.navigate(['/my-events']);
        },
        error: (error) => {
          console.error('Erro ao deletar evento:', error);
          this.snackBar.open(
            this.langService.translate('event.deleted.error'),
            'OK',
            {duration: 5000}
          );
        }
      });
  }

  onFinishEvent(): void {
    if (!this.evento()?.id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.langService.translate('event.finish') || 'Finalizar Evento',
        message: this.langService.translate('event.finish.confirm') || 'Tem certeza que deseja finalizar este evento? Esta ação não pode ser desfeita.'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && this.evento()?.id) {
        this.isSaving.set(true);

        const updates = {
          status: 'FINALIZADO'
        };

        this.eventoService.atualizarEventoParcial(this.evento()!.id!, updates)
          .pipe(finalize(() => this.isSaving.set(false)))
          .subscribe({
            next: () => {
              this.snackBar.open(
                this.langService.translate('event.finished.success') || 'Evento finalizado!',
                'OK',
                { duration: 3000 }
              );
              // Recarregar o evento para atualizar o status
              this.loadEvent(this.evento()!.id!);
            },
            error: (error: any) => {
              console.error('Erro ao finalizar evento:', error);
              this.snackBar.open(
                this.langService.translate('event.finished.error') || 'Erro ao finalizar evento.',
                'OK',
                { duration: 3000 }
              );
            }
          });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/my-events']);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(this.langService.currentLanguage());
  }

  openLocationPicker(): void {
    // Tenta pegar localização atual do usuário
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.openMapDialog(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // fallback: local atual do evento, ou SP
        const [lat, lng] = this.getCurrentEventLatLng();
        this.openMapDialog(lat, lng);
      }
    );
  }

  private getCurrentEventLatLng(): [number, number] {
    const local = this.eventForm.get('local')?.value;

    if (local && local.includes(',')) {
      // @ts-ignore
      const [latStr, lngStr] = local.split(',').map(v => v.trim());
      return [parseFloat(latStr), parseFloat(lngStr)];
    }

    // fallback São Paulo
    return [-23.55052, -46.633308];
  }

  private openMapDialog(lat: number, lng: number): void {
    const dialogRef = this.dialog.open(LocationPickerDialogComponent, {
      width: '90%',
      maxWidth: '600px',
      data: {
        lat,
        lng,
        mapboxToken: this.mapboxToken, // precisa injetar no construtor
        styleId: 'mapbox/streets-v11'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const {lat, lng, address} = result;

        // Atualiza campo local
        this.eventForm.patchValue({
          local: address
        });
      }
    });
  }
}

