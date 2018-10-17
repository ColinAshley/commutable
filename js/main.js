// functions
function getData() {
  // Request data for specified stations
  let from = document.getElementById("fromCRS1").value;
  let dest = document.getElementById("toCRS1").value;
  document.getElementById("fromCRS2").value = dest;
  document.getElementById("toCRS2").value = from;
  let rows = 8;

  // Using Huxley SOAP->JSON proxy
  const urls = [
    `https://huxley.apphb.com/departures/${from}/to/${dest}/${rows}?expand=true&accessToken=6c40282b-0b27-431d-97c5-7366a47e6e51`,
    `https://huxley.apphb.com/departures/${dest}/to/${from}/${rows}?expand=true&accessToken=6c40282b-0b27-431d-97c5-7366a47e6e51`
  ];

  Promise.all(urls.map(url => fetch(url)))
    .then(resp => Promise.all( resp.map(r => r.json()) ))
    .catch(e => requestError(e, 'Error'))
    .then(result => showData(result));
}


function showData(data) {
  let lastRefresh = new Date().toLocaleTimeString('en-UK');
  document.getElementsByClassName('last-update')[0].textContent = `Last Update: ${lastRefresh}`;

  let journeyDest = document.getElementById("toCRS1").value;
  let journeyOrigin = document.getElementById("fromCRS1").value;

  for (listnum = 0; listnum < 2; listnum++) {
    if (listnum == 1) {
      journeyDest = document.getElementById("toCRS2").value;
      journeyOrigin = document.getElementById("fromCRS2").value;
    }

    let delaydata = '';
    delaylist[listnum].innerHTML = '';
    nrccMessage[listnum].innerHTML = '';

    delaydata += `<tr><th>Plat</th><th>Scheduled</th><th>Expected</th><th>Stops</th><th>Arrives Dest</th></tr>`;
    for ( const [trainNum, trainData] of Object.entries(data[listnum].trainServices)) {
      let plat = trainData.platform !== null ? trainData.platform : '__';

      delaydata += `<tr><td>${plat}</td><td>${trainData.std}</td>`;

      if (trainData.etd != "On time") {
        delaydata += `<td class="delayed">`;
      }
      else {
        delaydata += `<td class="on-time">`;
      }

      let numCalls = 0;
      delaydata += `${trainData.etd}</td>`;

      for ( const [callpoint, callData] of Object.entries(trainData.subsequentCallingPoints[0].callingPoint)) {
        if (callData.locationName == this.journeyOrigin ) {
          let numCalls = 0;
        }
        numCalls++;
        if (callData.locationName == journeyDest) {
          delaydata += `<td>${numCalls-1}</td>`;
          if (callData.et == 'On time') {
            delaydata += `<td class="on-time">${callData.st}</td>`;
          }
          else {
            delaydata += `<td class="delayed">${callData.et}</td>`;
          }
          delaydata += `</tr>`;
          break;
        }
      }
    }

    delaylist[listnum].innerHTML = delaydata;

    if (data[listnum].nrccMessages !== null) {
      nrccMessage[listnum].innerHTML+=`<p class="nrcc-text">${data[listnum].nrccMessages[0].value}</p>`;
    }
    else {
      nrccMessage[listnum].innerHTML='';
    }
  }

  footer[0].innerHTML = 'Data supplied by nationalrail.co.uk';
  saveLocalData();
}

function requestError(e, part) {
    console.log(`Error is: ${e}`);
    nrccMessage[0].innerHTML = 'Invalid Route Selected';
}

function fillStations(destinations, field ) {
  const select = document.getElementById(field);
  for(const destination of destinations) {
    const option = document.createElement('option');
    option.innerHTML = destination;
    option.value = destination;
    select.append(option);
  }
}

function saveLocalData() {
  let from = document.getElementById("fromCRS1").value;
  let to = document.getElementById("toCRS1").value;
  window.localStorage.setItem('from', from );
  window.localStorage.setItem('to', to );
}

function readLocalData() {
  from = window.localStorage.getItem('from' );
  to = window.localStorage.getItem('to');
  document.getElementById("fromCRS1").value = from;
  document.getElementById("toCRS1").value = to;
}

// main code
// Register Servive Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js');
  });
}
// Get table ready
const delaylist = document.getElementsByClassName("delay-list");
const footer = document.getElementsByClassName("footer");
const nrccMessage = document.getElementsByClassName("nrcc-message");
const stations = [ 'Bournemouth', 'Earley', 'Guildford', 'London Waterloo', 'Paddington', 'Reading', 'Woking', 'Wokingham' ];
// Fill the select options
fillStations(stations, 'fromCRS1');
fillStations(stations, 'toCRS1');
fillStations(stations, 'fromCRS2');
fillStations(stations, 'toCRS2');
// Read saved journey if available
readLocalData();
// Run the app
getData();