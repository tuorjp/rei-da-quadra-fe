import {Component, inject, Input, OnInit, signal} from '@angular/core';
import {AdministraoDeTimesService, Inscricao, TimeResponseDTO, TimesService} from '../../api';
import {MatButton} from '@angular/material/button';
import {
  MatAccordion,
  MatExpansionPanel, MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatList, MatListItem, MatListItemLine, MatListItemTitle} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-event-teams',
  imports: [
    CommonModule,
    MatButton,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatList,
    MatListItem,
    MatListItemTitle,
    MatListItemLine,
    MatIcon,
    MatTooltip,
  ],
  templateUrl: './event-teams.component.html',
  styleUrl: './event-teams.component.css'
})
export class EventTeamsComponent implements OnInit{
  @Input() eventoId!: number | undefined;
  @Input() isOrganizer: boolean = false;

  admTimesService = inject(AdministraoDeTimesService);
  timeService = inject(TimesService)

  timesDoEvento = signal<TimeResponseDTO[]>([]);

  ngOnInit() {
   this.carregarTimesCriados();
  }

  distribuirJogadoresPorTimes(id: number | undefined) {
    if(id) {
      this.admTimesService.distribuirTimes(id).subscribe({
        next: (response) => {
          this.carregarTimesCriados();
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  carregarTimesCriados() {
    if (this.eventoId) {
      this.timeService.listarPorEvento1(this.eventoId).subscribe({
        next: async (response) => {
          let times;
          if(response instanceof Blob) {
            const jsonStr = await response.text();
            times = JSON.parse(jsonStr);
          } else {
            times = response;
          }
          this.timesDoEvento.set(times);
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }
}
