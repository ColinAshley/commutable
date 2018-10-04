// functions
function getData() {
  // Request data for specified stations
  let from1 = document.getElementById("fromCRS1").value;
  let dest = document.getElementById("toCRS").value;
  let rows = 8;


  fetch(`https://huxley.apphb.com/departures/${from1}/to/${dest}/${rows}?expand=true&accessToken=6c40282b-0b27-431d-97c5-7366a47e6e51`, {
    // nothing here
    }).then(response => response.json())
    .then(showData)
    .catch(e => requestError(e, 'Error'));
  }

function showData(data) {
  let lastRefresh = new Date().toLocaleTimeString('en-UK');
  document.getElementsByClassName('last-update')[0].textContent = `Last Update: ${lastRefresh}`;
  let journeyDest = document.getElementById("toCRS").value;
  let journeyOrigin = document.getElementById("fromCRS1").value;
  let delaydata = '';
  delaylist[0].innerHTML = '';
  nrccMessage[0].innerHTML = '';

  delaydata += `<tr><th>Plat</th><th>Scheduled</th><th>Expected</th><th>Stops</th><th>Arrives Dest</th></tr>`;
  for ( const [trainNum, trainData] of Object.entries(data.trainServices)) {
    let plat = trainData.platform != null ? trainData.platform : '__';

    delaydata += `<tr>` +
                 `<td>${plat}</td>` +
                 `<td>${trainData.std}</td>`;

    if (trainData.etd != "On time") {
      delaydata += `<td class="delayed">`;
    }
    else {
      delaydata += `<td class="on-time">`;
    }

    let numCalls = 0
    delaydata += `${trainData.etd}</td>`;

    for ( const [callpoint, callData] of Object.entries(trainData.subsequentCallingPoints[0].callingPoint)) {
      if (callData.locationName == journeyOrigin ) {
        let numCalls = 0;
      }
      numCalls++;
      if (callData.locationName == journeyDest) {
        delaydata += `<td>${numCalls-1}</td>`;
        if (callData.et == 'On time') {
          delaydata += `<td class="on-time">${callData.st}</td>`;
        }
        else
        {
          delaydata += `<td class="delayed">${callData.et}</td>`;
        }
        delaydata += `</tr>`;
        break;
      }
    }
  }

  delaylist[0].innerHTML = delaydata;
  if ( data.nrccMessages != null ) {
    nrccMessage[0].innerHTML=`${data.nrccMessages[0].value}`;
  }
  else
  {
    nrccMessage[0].innerHTML='';
  }
  footer[0].innerHTML = 'Data supplied by nationalrail.co.uk';
  saveLocalData();
}

function requestError(e, part) {
    console.log(e);
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
  let to = document.getElementById("toCRS").value;
  window.localStorage.setItem('from', from );
  window.localStorage.setItem('to', to );
}

function readLocalData() {
  from = window.localStorage.getItem('from' );
  to = window.localStorage.getItem('to');
  document.getElementById("fromCRS1").value = from;
  document.getElementById("toCRS").value = to;
}

// main code
// Get table ready
const delaylist = document.getElementsByClassName("delay-list");
const footer = document.getElementsByClassName("footer");
const nrccMessage = document.getElementsByClassName("nrcc-message");
const stations = [ 'Earley', 'Guildford', 'London Waterloo', 'Paddington', 'Reading', 'Woking', 'Wokingham' ];
fillStations(stations, 'fromCRS1');
fillStations(stations, 'toCRS');
readLocalData();
getData();