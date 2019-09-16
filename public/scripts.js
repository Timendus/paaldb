window.addEventListener('load', async () => {
  const mymap = L.map('map')
                 .setView([52.232947, 5.697784], 7);

  const tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}@2x?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'satellite-v9',
    accessToken: 'pk.eyJ1IjoidGltZW5kdXMiLCJhIjoiY2swbWhueTlrMTNuZDNnc3ZqcWV6aG5kdyJ9.1uDVkJBRa0DdbU8PD_inog',
    tileSize: 512,
    zoomOffset: -1,
    detectRetina: true
  });
  tileLayer.addTo(mymap);

  // Change map type from satellite only to satellite plus streets when we zoom in
  mymap.on('zoom', (event) => {
    if ( event.target._zoom > 10 ) {
      tileLayer.options.id = 'satellite-streets-v11';
    } else {
      tileLayer.options.id = 'satellite-v9';
    }
  });

  // Hide location popup when we click the map
  mymap.on('click', () => {
    document.getElementById('location').classList.remove('active');
  });

  // Render locations
  // Show location popup when we click a location

  const canvasLayer = L.canvas({ padding: 0.5 });
  const locations = JSON.parse(await request('/api/locations'));

  for ( const location of locations ) {
    L.circleMarker([location.latitude, location.longitude], {
      renderer:    canvasLayer,
      radius:      15,
      weight:      5,
      opacity:     1,
      fillOpacity: (Math.min(3, location.numberOfMentions)/3),
      color:       '#108',
      fillColor:   '#20a'

    })
    .addTo(mymap)
    .on('click', () => {
      showDetails(location);
    });
  }
});

function request(url) {
  return new Promise((resolve, reject) => {
    const httpRequest = new XMLHttpRequest()
    httpRequest.addEventListener('readystatechange', (event) => {
      if ( httpRequest.readyState !== XMLHttpRequest.DONE ) return;
      if ( httpRequest.status !== 200 ) return reject("Received an error from the back-end");
      resolve(httpRequest.responseText);
    });

    httpRequest.open('GET', url);
    httpRequest.send();
  });
}

async function showDetails(location) {
  const details = JSON.parse(await request(`/api/locations/${location.id}`));

  document.getElementById('location').innerHTML = `
    <h1>${location.name}</h1>

    ${ location.description ? `
      <section class='description'>
        ${location.description}
      </section>
    ` : '' }

    ${ location.fireHazard  ? `
      <section class='fireHazard'>
        <p>Brandrisico: <b>${location.fireHazard}</b></p>
      </section>
    ` : '' }

    <section class='mentions'>
      <p>Deze locatie wordt vermeld door:</p>
      <ul>
        ${
          details.Mentions.map(m => {
            return `
              <li>
                <details>
                  <summary><b>${m.Source.name}</b> - ${m.status}</summary>
                  <h2>${m.name}</h2>
                  ${ m.description ? `
                    <section class='description'>
                      ${m.description}
                    </section>
                  ` : '' }
                </details>
              </li>
            `;
          }).join('')
        }
      </ul>
    </section>
  `;

  document.getElementById('location').classList.add('active');
}
