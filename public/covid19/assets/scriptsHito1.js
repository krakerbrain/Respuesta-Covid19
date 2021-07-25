import { toggleLinks, postData } from "./scriptsHito2.js";

// 2. Consumir la API http://localhost:3000/api/total con JavaScript o jQuery.

const getCovidTotalInfo = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/total");
    const { data } = await response.json();
    if (data) {
      drawChart(data);
      fillTable(data);
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};

const init = () => {
  getCovidTotalInfo();
  const token = localStorage.getItem("jwt-token");
  if (token) {
    toggleLinks();
  }
};

init();

//   3. Desplegar la información de la API en un gráfico de barra que debe mostrar sólo los
// países con más de 10000 casos activos.

const prepareDataChart = (data) => {
  data = data.filter((item) => item.confirmed >= 10000);
  return {
    labels: data.map((item) => item.location),
    datasets: [
      {
        label: "Casos activos",
        backgroundColor: "rgb(255, 99, 132)",
        data: data.map((item) => item.active),
      },
      {
        label: "Casos confirmados",
        backgroundColor: "rgb(255, 205, 86)",
        data: data.map((item) => item.confirmed),
      },
      {
        label: "Casos muertos",
        backgroundColor: "rgb(201, 203, 207)",
        data: data.map((item) => item.deaths),
      },
      {
        label: "Casos recuperados",
        backgroundColor: "rgb(75, 192, 192)",
        data: data.map((item) => item.recovered),
      },
    ],
  };
};

const drawChart = (data) => {
  const { labels, datasets } = prepareDataChart(data);
  const covidChart = document.getElementById("covidChart");
  new Chart(covidChart, {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets,
    },
  });
};

// 4. Desplegar toda la información de la API en una tabla.

const fillTable = (data) => {
  let rows = "";
  $.each(data, (i, row) => {
    rows += ` <tr>
        <td> ${row.location} </td>
        <td> ${row.active} </td>
        <td> ${row.confirmed} </td>
        <td> ${row.deaths} </td>
        <td> ${row.recovered} </td>
        <td> <a class="js-modal-details" 
        country-location='${row.location}'
        href="#"> Ver detalle </a></td>

        </tr>
        `;
  });
  $("#js-table-countries tbody").append(rows);
};
// <!-- mario -->
$("#js-table-countries tbody").on("click", "a.js-modal-details", function (e) {
  e.preventDefault();
  let country = this.getAttribute("country-location");
  getCountryInfo(country);
});

const getCountryInfo = async (country) => {
  try {
    const response = await fetch(`/api/countries/${country}`);
    const { data } = await response.json();
    showModalWithInfo(data);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};

// 5. Cada fila de la tabla debe incluir un link que diga "ver detalle", al hacer click levante
// un modal y muestre los casos activos, muertos, recuperados y confirmados en un
// gráfico, para obtener esta información debes llamar a la API
// http://localhost:3000/api/countries/{country} al momento de levantar el modal

const showModalWithInfo = (data) => {
  $("#countryModal").modal("show");
  $(".modal-title").text(data.location);
  const { confirmed, deaths, recovered, active } = data;
  const modalCovidChart = document.getElementById("modalCovidChart");
  new Chart(modalCovidChart, {
    type: "pie",
    data: {
      labels: ["activos", "confirmados", "muertos", "recuperados"],
      datasets: [
        {
          data: [active, confirmed, deaths, recovered],
          backgroundColor: ["rgb(255, 99, 132)", "rgb(255, 205, 86)", "rgb(201, 203, 207)", "rgb(75, 192, 192)"],
        },
      ],
    },
  });
};
