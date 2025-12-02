import { Component, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import * as L from 'leaflet';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-location-picker-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatIconButton,
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatButton
  ],
  templateUrl: './location-picker-dialog.component.html',
  styleUrls: ['./location-picker-dialog.component.css']
})
export class LocationPickerDialogComponent implements AfterViewInit, OnDestroy {

  private map!: L.Map;
  private marker?: L.Marker;

  searchQuery = '';
  searchResults: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<LocationPickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 80);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  //Inicialização completa do mapa
  private initMap(): void {
    const lat = this.data?.lat ?? -23.55;
    const lng = this.data?.lng ?? -46.63;

    this.map = L.map('locationMap', {
      center: [lat, lng],
      zoom: 14
    });

    // Mapbox tile layer
    L.tileLayer(
      `https://api.mapbox.com/styles/v1/${this.data.styleId}/tiles/{z}/{x}/{y}?access_token=${this.data.mapboxToken}`,
      {
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 22
      }
    ).addTo(this.map);

    // Marcador inicial
    this.marker = L.marker([lat, lng]).addTo(this.map);

    // Clique no mapa = move marcador e busca endereço
    this.map.on('click', (e: any) => {
      const pos = e.latlng;

      if (this.marker) this.marker.setLatLng(pos);
      else this.marker = L.marker(pos).addTo(this.map);

      this.reverseGeocode(pos.lat, pos.lng);
    });

    // Carregar lugares esportivos próximos
    this.loadNearbySportsPlaces(lat, lng);
  }

  //Buscar quadras, ginásios, campos etc. próximos
  private loadNearbySportsPlaces(lat: number, lng: number): void {
    const categories = [
      'pitch',
      'soccer',
      'sports_centre',
      'stadium'
    ];

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${categories.join(
      ','
    )}.json?proximity=${lng},${lat}&types=poi&limit=10&access_token=${this.data.mapboxToken}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.features) return;

        data.features.forEach((place: any) => {
          const [plng, plat] = place.geometry.coordinates;

          const sportMarker = L.icon({
            iconUrl: 'assets/sport-marker.png',
            iconSize: [36, 36],
            iconAnchor: [18, 36]
          });

          L.marker([plat, plng], { icon: sportMarker })
            .addTo(this.map)
            .bindPopup(`
              <b>${place.text}</b><br>
              ${place.place_name}<br>
              <button id="select-${place.id}" style="margin-top:5px; padding:4px 8px; cursor:pointer;">
                Selecionar
              </button>
            `)
            .on('popupopen', () => {
              setTimeout(() => {
                const btn = document.getElementById(`select-${place.id}`);
                if (btn) {
                  btn.addEventListener('click', () => {
                    this.selectPOI(plat, plng, place.place_name);
                  });
                }
              }, 100);
            });
        });
      });
  }

  // Selecionou um ginásio/quadra/campo
  private selectPOI(lat: number, lng: number, address: string): void {
    if (!this.marker) {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    } else {
      this.marker.setLatLng([lat, lng]);
    }

    this.searchQuery = address;
    this.map.setView([lat, lng], 17);
  }


  //Autocomplete — busca por endereço ou locais
  onSearchInput(): void {
    if (this.searchQuery.length < 3) {
      this.searchResults = [];
      return;
    }

    this.performSearch();
  }

  protected performSearch(): void {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      this.searchQuery
    )}.json?access_token=${this.data.mapboxToken}&autocomplete=true&limit=5`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.searchResults = data.features || [];
      });
  }

  selectSearchResult(result: any): void {
    const [lng, lat] = result.center;

    this.map.setView([lat, lng], 16);

    if (this.marker) this.marker.setLatLng([lat, lng]);
    else this.marker = L.marker([lat, lng]).addTo(this.map);

    this.reverseGeocode(lat, lng);
    this.searchResults = [];
  }

  //Reverse Geocoding — coordenadas → endereço
  private reverseGeocode(lat: number, lng: number): void {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.data.mapboxToken}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.features?.length) {
          this.searchQuery = data.features[0].place_name;
        }
      });
  }


  // Confirmar seleção
  confirmSelection(): void {
    if (!this.marker) return;

    const coords = this.marker.getLatLng();
    this.dialogRef.close({
      lat: coords.lat,
      lng: coords.lng,
      address: this.searchQuery
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
