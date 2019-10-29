window.addEventListener('load', async () => {

  const mapboxToken = await requestOrError('/api/mapbox/token', 'Kan niet verbinden met de server');

  const theMap = L.map('map')
                  .setView([52.232947, 5.697784], 7);

  const tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}@2x?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'satellite-v9',
    accessToken: mapboxToken,
    tileSize: 512,
    zoomOffset: -1,
    detectRetina: true
  });
  tileLayer.addTo(theMap);

  // Change map type from satellite only to satellite plus streets when we zoom in
  theMap.on('zoom', (event) => {
    if ( event.target._zoom > 10 ) {
      tileLayer.options.id = 'satellite-streets-v11';
    } else {
      tileLayer.options.id = 'satellite-v9';
    }
  });

  // Hide location popup when we click the map
  theMap.on('click', hideDetails);


  /** Render locations **/

  const canvasLayer  = L.canvas({ padding: 0.5 });
  const locations    = JSON.parse(await requestOrError('/api/locations', 'Kan de locaties niet ophalen van de server'));
  let activeLocation = null;

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
    .addTo(theMap)

    // Show location popup when we click a location
    .on('click', (event) => {
      showDetails(location, event.target);
      L.DomEvent.stopPropagation(event);
    });
  }

  // Map has been rendered, stop loading animation
  document.getElementById('location').classList.remove('loading');
  document.getElementById('location').classList.remove('active');


  /** Helper functions **/

  async function showDetails(location, marker) {
    hideActiveLocation();
    activeLocation = marker;
    showActiveLocation();

    const timeout = window.setTimeout(() => {
      document.getElementById('location').innerHTML = 'Bezig met het ophalen van de locatiegegevens...';
      document.getElementById('location').classList.add('loading');
      document.getElementById('location').classList.add('active');
    }, 200);

    let details;
    try {
      details = JSON.parse(await requestOrError(`/api/locations/${location.id}`));
    } catch(error) {
      details = { requestError: true, Mentions: [] };
    }

    document.getElementById('location').innerHTML = `
      <h1>${location.name}</h1>

      ${ details.requestError ? `
        <section class='error'>
          <p><b>Error:</b> Kon locatiegegevens niet ophalen.</p>
        </section>
      ` : '' }

      <section class='location'>
        <p>
          Locatie: (<tt>${Math.abs(location.latitude)}</tt>° ${location.latitude > 0 ? 'N' : 'Z'},
            <tt>${Math.abs(location.longitude)}</tt>° ${location.longitude > 0 ? 'O' : 'W'})
        </p>
      </section>

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

      ${ details.Mentions.filter(m => m.status == 'Verwijderd').length > 0 ? `
        <section class='mayBeRemoved'>
          <p><b>Let op:</b> Deze locatie is door sommige bronnen verwijderd. Het is mogelijk dat deze locatie niet meer bestaat.</p>
        </section>
      ` : ''}

      ${ details.Mentions.length > 0 ? `
        <section class='mentions'>
          <p>Deze locatie wordt vermeld door:</p>
          <ul>
            ${
              details.Mentions.map(m => {
                return `
                  <li>
                    <details>

                      <summary>
                        <b>${m.Source.name}</b> - ${m.status}
                        ${ m.Properties.length > 0 ? `
                          <section class='properties'>
                            ${
                              m.Properties.map(p => {
                                return p.image ? `<img class='${p.label}-${p.value}' src='${p.image}' title='${p.description}' />` : '';
                              }).join('')
                            }
                          </section>
                        ` : ''}
                      </summary>

                      <h2>${m.name}</h2>

                      ${ m.Properties.filter(p => p.image).length > 0 ? `
                        <h3>Eigenschappen van deze locatie</h3>
                        <ul class='properties'>
                          ${
                            m.Properties.map(p => {
                              return p.image ? `<li><img class='${p.label}-${p.value}' src='${p.image}' title='${p.description}' /> ${p.description}</li>` : '';
                            }).join('')
                          }
                        </ul>
                      ` : ''}

                      ${ m.description ? `
                        <section class='description'>
                          ${m.description}
                        </section>
                      ` : '' }

                      ${ m.link ? `
                        <a class='read-more' href='${m.link}' target='_blank'>Lees verder bij ${m.Source.name} &raquo;</a>
                      ` : ''}

                    </details>
                  </li>
                `;
              }).join('')
            }
          </ul>
        </section>
      ` : ''}
    `;

    window.clearTimeout(timeout);
    document.getElementById('location').classList.remove('loading');
    document.getElementById('location').classList.add('active');
  }

  function hideDetails(event) {
    hideActiveLocation();
    document.getElementById('location').classList.remove('active');
  }

  // Make currently selected location red
  function showActiveLocation() {
    if ( activeLocation ) {
      activeLocation.options.color     = '#801';
      activeLocation.options.fillColor = '#a02';
      activeLocation.redraw();
    }
  }

  // Make previously selected location blue again
  function hideActiveLocation() {
    if ( activeLocation ) {
      activeLocation.options.color     = '#108';
      activeLocation.options.fillColor = '#20a';
      activeLocation.redraw();
    }
  }

  // Show an error
  function showError(message) {
    document.getElementById('location').innerHTML = message;
    document.getElementById('location').classList.remove('loading');
    document.getElementById('location').classList.add('error');
    document.getElementById('location').classList.add('active');
  }

  // Do a GET request or show an error
  async function requestOrError(url, message) {
    try {
      return await request(url);
    } catch(error) {
      console.error(error);
      showError(message);
      throw(error);
    }
  }

  // Do a GET request to somewhere, wrapped in a Promise
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

});
