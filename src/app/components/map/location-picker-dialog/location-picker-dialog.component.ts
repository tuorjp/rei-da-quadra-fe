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
import {MatButton, MatIconButton} from '@angular/material/button';

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

  private initMap(): void {
    const lat = this.data?.lat ?? -23.55;
    const lng = this.data?.lng ?? -46.63;
    const zoom = 14;

    this.map = L.map('locationMap', {
      center: [lat, lng],
      zoom
    });

    // Mapbox Tiles
    L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${this.data.mapboxToken}`,
      {
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 22
      }
    ).addTo(this.map);

    // Marcador inicial
    this.marker = L.marker([lat, lng]).addTo(this.map);

    // Reverse geocode ao clicar
    this.map.on('click', (e: any) => {
      const pos = e.latlng;

      if (this.marker) this.marker.setLatLng(pos);
      else this.marker = L.marker(pos).addTo(this.map);

      this.reverseGeocode(pos.lat, pos.lng);
    });
  }

  // ===== AUTOCOMPLETE / SEARCH =====
  onSearchInput(): void {
    if (this.searchQuery.length < 3) {
      this.searchResults = [];
      return;
    }

    this.performSearch();
  }

  performSearch(): void {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      this.searchQuery
    )}.json?access_token=${this.data.mapboxToken}&autocomplete=true&limit=5`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        this.searchResults = data.features || [];
      });
  }

  selectSearchResult(result: any): void {
    const [lng, lat] = result.center;

    this.map.setView([lat, lng], 16);

    if (this.marker) this.marker.setLatLng([lat, lng]);
    else this.marker = L.marker([lat, lng]).addTo(this.map);

    this.searchResults = [];
  }

  // ===== REVERSE GEOCODING =====
  reverseGeocode(lat: number, lng: number): void {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.data.mapboxToken}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          this.searchQuery = data.features[0].place_name;
        }
      });
  }

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
