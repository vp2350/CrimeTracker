const states = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

const dataFilter = [
  'violent_crime',
  'aggravated_assault',
  'arson',
  'burglary',
  'homicide',
  'larceny',
  'motor_vehicle_theft',
  'property_crime',
  'rape_legacy',
  'rape_revised',
  'robbery',
];

let stateData = {};

let selectedState = 'CA';

const fetchAllStates = (from, to) => {
  stateData = {};
  states.forEach(state => {
    setTimeout(() => {
      stateData[state] = getData(state, from, to);
    }, 40);
  });
};

let labelSet = [];

const getData = (state, from, to) => {
  const temp = [];
  fetch(
    `https://api.usa.gov/crime/fbi/sapi/api/estimates/states/${state}/${from}/${to}?API_KEY=7exVMetuiG6pwIq6154CKAqvsdDyL3ehZHkoMNdC`
  )
    .then(res => res.json())
    .then(data => {
      data.results.forEach(result => {
        temp.push(result);
      });
    });
  return temp;
};

mapboxgl.accessToken =
  'pk.eyJ1IjoiZGFtaXNocmEiLCJhIjoiY2tpNGJhanc3MXc5ZzJ4cDVqMDVoZ21lNyJ9.YuwauvKn_hV27sDrn4Pstg';

let selected_crime_state = [];
let selected_crime_national = [];

let chart1;
let chart2;

const refreshCharts = () => {
  var ctx1 = document
    .getElementById('country_wide_selected_crime')
    .getContext('2d');
  chart1 = new Chart(ctx1, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: labelSet,
      datasets: [
        {
          label: 'US: ' + filter.value,
          borderColor: '#33c3f0',
          data: selected_crime_national,
        },
      ],
    },

    // Configuration options go here
    options: {},
  });
  var ctx2 = document
    .getElementById('state_wide_selected_crime')
    .getContext('2d');
  chart2 = new Chart(ctx2, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: labelSet,
      datasets: [
        {
          label: selectedState + ': ' + filter.value,
          borderColor: '#ff6384',
          data: selected_crime_state,
        },
      ],
    },

    // Configuration options go here
    options: {},
  });
};

const delCanvas = () => {
  let canvas1 = document.getElementById('country_wide_selected_crime');
  let canvas2 = document.getElementById('state_wide_selected_crime');
  let canvasParent = canvas1.parentNode;
  canvasParent.removeChild(canvas1);
  canvasParent.removeChild(canvas2);
  canvas1 = document.createElement('canvas');
  canvas1.id = 'country_wide_selected_crime';
  canvas2 = document.createElement('canvas');
  canvas2.id = 'state_wide_selected_crime';
  canvasParent.appendChild(canvas1);
  canvasParent.appendChild(canvas2);
};

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
  center: [-92.6500523, 38.250033], // starting position [lng, lat]
  zoom: 3.3, // starting zoom
});
map.on('click', e => {
  fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${e.lngLat.lng},${e.lngLat.lat}.json?access_token=${mapboxgl.accessToken}`
  )
    .then(res => res.json())
    .then(data => {
      const state = data.features[3].properties.short_code.split('-')[1];
      selectedState = state;
      document.getElementById('selected_state').innerText = '';
      document
        .getElementById('selected_state')
        .appendChild(document.createTextNode(selectedState));
    })
    .catch(err => console.log('The api acts up every now and then: ' + err));
});

window.onload = () => {
  document
    .getElementById('selected_state')
    .appendChild(document.createTextNode(selectedState));
  console.log(states.length);
  const filter = document.getElementById('filter');
  dataFilter.forEach(filterElement => {
    const option = document.createElement('option');
    option.value = filterElement;
    option.innerText = filterElement;
    filter.appendChild(option);
  });
  const from = document.getElementById('from');
  const to = document.getElementById('to');
  const dataFetch = document.getElementById('dataFetch');
  fetchAllStates(from.value, to.value);
  console.log(stateData[selectedState]);
  refreshCharts();
  setTimeout(() => {
    console.log(stateData[selectedState].length);
    stateData[selectedState].forEach(data =>
      selected_crime_state.push(data[filter.value])
    );
    for (const [_, value] of Object.entries(stateData)) {
      let totalValue = 0;
      value.forEach(data => {
        totalValue += data[filter.value];
      });
      selected_crime_national.push(totalValue);
    }
    refreshCharts();
  }, 2000);
  for (let i = from.value; i <= to.value; i++) {
    labelSet.push(i);
  }

  dataFetch.addEventListener('click', () => {
    fetchAllStates(from.value, to.value);
    delCanvas();

    labelSet = [];
    for (let i = from.value; i <= to.value; i++) {
      labelSet.push(i);
    }

    setTimeout(() => {
      console.log(stateData[selectedState]);
      console.log(filter.value);
      selected_crime_state = [];
      stateData[selectedState].forEach(data => {
        console.log(data[filter.value]);
        selected_crime_state.push(data[filter.value]);
      });
      selected_crime_national = [];
      for (const [_, value] of Object.entries(stateData)) {
      let totalValue = 0;
      value.forEach(data => {
        totalValue += data[filter.value];
      });
      selected_crime_national.push(totalValue);
    }
      console.log(selected_crime_state);
      refreshCharts();
    }, 2000);
  });
};
