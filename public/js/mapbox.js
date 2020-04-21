/* eslint-disable */

export function mapBox(locations) {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibmF1dmFsc2giLCJhIjoiY2s5ODVkd2RyMG00NTNudGExazdjeTV1eSJ9.WFNWw7D4uJgCwFUeHC1Nqw';

  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/nauvalsh/ck9867uol4mpo1invubo17cty',
    scrollZoom: false
  });

  let bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create element marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // extends map bounds to include current locations
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 180,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
}
