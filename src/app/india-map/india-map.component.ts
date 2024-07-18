import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-india-map',
  templateUrl: './india-map.component.html',
  styleUrls: ['./india-map.component.css'],
})
export class IndiaMapComponent implements OnInit {
  private map!: L.Map;
  public locationDetails: any | null = null;
  public locationWeather: any | null = null;
  public locationSelected: any | null = null;
  public loadingPredictions: boolean = false;
  public notif: boolean = true;
  public locationSection: boolean = false;
  readonly panelOpenState = signal(false);
  constructor(private http: HttpClient) {
    console.log('HttpClient injected:', this.http);
  }

  ngOnInit() {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [20.5937, 78.9629],
      zoom: 5,
    });
    // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
    // https://api.protomaps.com/tiles/v3/{z}/{x}/{y}.mvt?key=31193702a92c02f7
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        'OpenStreetMap; <a href="https://openstreetmap.com/">OpenStreetMap.com</a>',
    }).addTo(this.map);

    this.map.on('click', this.onMapClick.bind(this)); // No need for .bind(this)
  }

  private onMapClick(e: L.LeafletMouseEvent): void {
    if (!e || !e.latlng) {
      console.error('Invalid click event data');
      return;
    }

    console.log(
      `Map clicked at latitude: ${e.latlng.lat} and longitude: ${e.latlng.lng}`
    );

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    this.locationDetails = null;
    this.locationWeather = null;
    this.locationSelected = null;
    this.locationSection = false;

    // Choose a geocoding API (replace with your chosen API endpoint)
    const geocodingApiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

    this.http.get<any>(geocodingApiUrl).subscribe({
      next: (response) => {
        var display_name: string = '';
        if (response.address.town) {
          display_name = response.address.town + ', ';
        }
        if (response.address.county) {
          display_name = response.address.county + ', ';
        }
        if (response.address.city) {
          display_name += response.address.city + ', ';
        }
        if (response.address.state_district) {
          display_name += response.address.state_district + ', ';
        }
        if (response.address.state) {
          display_name += response.address.state + ', ';
        }
        if (response.address.country) {
          display_name += response.address.country;
        }
        // response.display_name;
        console.log(display_name);
        this.sendLocationDetails(display_name, lat, lng);
      },
      error: (error) => {
        console.error('Error fetching location details:', error);
      },
    });
  }

  // Replace with your backend API endpoint
  private sendLocationDetails(
    location: string,
    latitude: number,
    longitude: number
  ) {
    const data = { location, latitude, longitude };
    var Responsedata: any = null;

    this.notif = false;
    this.locationSection = true;
    this.locationSelected = location;
    this.loadingPredictions = true;

    this.http.post('http://localhost:3000/location-weather', data).subscribe({
      next: (response) => {
        this.loadingPredictions = false;
        this.locationDetails = response;
        // console.log('Location details:', this.locationDetails);
        // console.log('Location data sent to backend:', response);
      },
      error: (error) => {
        this.loadingPredictions = false;
        if (error.status === 429) {
          this.locationDetails = 'Too Many requests. Please try again later.';
        }
        // Assuming you want to stop loading animation
        else {
          this.locationDetails =
            'Error retrieving weather data. Please try again later.'; // General error message
        }
        console.error('Error sending location data:', error);
      },
    });
  }
}
