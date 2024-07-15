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
    // debugger;

    //below part gives coordinates
    // const locationData: LocationDetails = { latitude: lat, longitude: lng };
    // console.log(locationData);

    // const confirmation = confirm(
    //   'Do you want to see details of this location?'
    // );
    // if (confirmation) {
    //   // const that = this;
    //   const handleConfirmation = () => {
    //     this.http
    //       .post('http://localhost:3000/location-details', locationData)
    //       .subscribe({
    //         next: (response) => {
    //           console.log('Location data sent to backend:', response);
    //         },
    //         error: (error) => {
    //           console.error('Error sending location data:', error);
    //         },
    //       });
    //   };
    //   handleConfirmation(); // Call the function immediately
    // }
  }

  // Replace with your backend API endpoint
  private sendLocationDetails(
    location: string,
    latitude: number,
    longitude: number
  ) {
    const data = { location };
    var Responsedata: any = null;
    // const confirmation = confirm(
    //   `Do you want to see details of this location ${location}?`
    // );
    // if (confirmation) {
    this.notif = false;
    this.locationSection = true;
    this.locationSelected = location;
    this.loadingPredictions = true;
    // const handleConfirmation = () => {
    // this.http
    //   .post('http://localhost:3000/location-details', data)
    //   .subscribe({
    //     next: (response) => {
    //       this.loadingPredictions = false;
    //       this.locationDetails = response;
    //       console.log('Location details:', this.locationDetails);
    //       console.log('Location data sent to backend:', response);
    //     },
    //     error: (error) => {
    //       console.error('Error sending location data:', error);
    //     },
    //   });

    this.http
      .get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,showers,snowfall,weather_code,pressure_msl,surface_pressure,wind_speed_10m&daily=weather_code,sunshine_duration,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max,shortwave_radiation_sum&past_days=7&forecast_days=14`
      )
      .subscribe({
        next: (response) => {
          Responsedata = response;
          Responsedata.location = location;

          console.log('Location weather:', Responsedata);
          this.http
            .post(
              'https://natural-disaster-predictor-backend.onrender.com/location-weather',
              Responsedata
            )
            .subscribe({
              next: (response) => {
                this.loadingPredictions = false;
                this.locationDetails = response;
                console.log('Location details:', this.locationDetails);
                console.log('Location data sent to backend:', response);
              },
              error: (error) => {
                this.loadingPredictions = false; // Assuming you want to stop loading animation
                this.locationDetails =
                  'Error retrieving weather data. Please try again later.'; // Set an error message for display
                console.log('Error message for user:', this.locationDetails); // Optional for debugging
                console.error('Error sending location data:', error);
              },
            });
        },
        error: (error) => {
          console.error('Error sending location weather:', error);
        },
      });

    console.log('Location weather 2:', Responsedata);
    // };
    //   handleConfirmation(); // Call the function immediately
    // }
  }
}
