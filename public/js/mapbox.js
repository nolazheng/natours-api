const locations = JSON.parse(document.getElementById('map').dataset.locations);
/* eslint-disable */
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoianVuZXlpbmciLCJhIjoiY204cGpjbHh2MGM0MzJxcTRnaTFjYTZpcyJ9.0OQS6bU5N-eJazXCbYLe-w';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/juneying/cm8pk50mj00bf01rdacg1gatk',
    scrollZoom: false,
    // center: [-118, 34], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    // zoom: 9, // starting zoom
    // interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
