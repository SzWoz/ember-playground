import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class GoogleMapsComponent extends Component {
  @service googleMaps;
  @service geocodingServices;
  // ... other code

  @tracked address = '';
  @tracked latitude = 42.877742;
  @tracked longitude = -97.380979;
  @tracked markers = [];
  @tracked selectedAddress = [];
  @tracked zoom = 4; //default value
  mapStyles = [
    {
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#ffffff', // Set the color for city labels
        },
      ],
    },
  ];

  @action
  updateAddress(event) {
    this.address = event.target.value;
    this.latitude = this.markers[-1].lat;
    this.lng = this.markers[-1].lng;
  }

  @action
  createMarkerFromAddress() {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        this.address
      )}&key=AIzaSyCcnzshzmKpzMOb2R699rKDPo2pAHRWB-k`
    )
      .then((response) => response.json())
      .then((data) => {
        const result = data.results[0];
        if (result) {
          const { lat, lng } = result.geometry.location;
          this.latitude = lat;
          this.longitude = lng;
          this.markers = [{ lat, lng }];
          this.zoom = 100;
        }
      })
      .catch((error) => {
        console.error('Error geocoding address:', error);
      });
  }

  @action
  async createMarkerFromMap(event) {
    const { googleEvent } = event;
    const { lat, lng } = googleEvent.latLng;

    if (lat && lng) {
      const marker = {
        lat: lat(),
        lng: lng(),
      };

      this.markers = [marker];

      const geocoder = new google.maps.Geocoder();

      await geocoder.geocode({ location: marker }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const selectedAddress = results[0].formatted_address;
          this.selectedAddress.push({ ...marker, selectedAddress });
        }
      });

      this.latitude = marker.lat;
      this.longitude = marker.lng;
      this.zoom = 100;
    }
  }

  @action
  removeMarker(event) {
    this.markers = [];
    this.zoom = 4;
    this.latitude = 42.877742;
    this.longitude = -97.380979;
  }
}
