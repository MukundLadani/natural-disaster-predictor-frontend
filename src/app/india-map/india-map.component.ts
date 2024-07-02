import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

// interface LocationDetails {
//   latitude: number;
//   longitude: number;
// }

@Component({
  selector: 'app-india-map',
  templateUrl: './india-map.component.html',
  styleUrls: ['./india-map.component.css'],
})
export class IndiaMapComponent implements OnInit {
  private map!: L.Map;
  public locationDetails: any | null = null;

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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', this.onMapClick.bind(this)); // No need for .bind(this)
  }

  // private sendLocationDetails(lat: number, lng: number) {
  //   const locationData: LocationDetails = { latitude: lat, longitude: lng };
  //   console.log('done done!');
  //   console.log(locationData);
  //   // Replace with your backend API endpoint
  //   this.http
  //     .post('http://localhost:3000/location-details', locationData)
  //     .subscribe({
  //       next: (response) => {
  //         console.log('Location data sent to backend:', response);
  //       },
  //       error: (error) => {
  //         console.error('Error sending location data:', error);
  //       },
  //     });
  // }

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

    // Choose a geocoding API (replace with your chosen API endpoint)
    const geocodingApiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

    this.http.get<any>(geocodingApiUrl).subscribe({
      next: (response) => {
        const display_name: string = response.display_name;
        // console.log(display_name);
        this.sendLocationDetails(display_name);
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
  private sendLocationDetails(location: string) {
    const data = { location };

    const confirmation = confirm(
      `Do you want to see details of this location ${location}?`
    );
    if (confirmation) {
      const handleConfirmation = () => {
        this.http
          .post('http://localhost:3000/location-details', data)
          .subscribe({
            next: (response) => {
              this.locationDetails = response;
              console.log('Location details:', this.locationDetails);
              console.log('Location data sent to backend:', response);
            },
            error: (error) => {
              console.error('Error sending location data:', error);
            },
          });
      };
      handleConfirmation(); // Call the function immediately
    }
  }
}
