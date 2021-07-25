$("#js-form-login").submit(async (event) => {
  event.preventDefault();
  const email = document.getElementById("js-input-email").value;
  const password = document.getElementById("js-input-password").value;
  postData(email, password);
});

// 3. Implementar la lógica para obtener el JWT cuando se ingrese el correo y contraseña
// a través del formulario.
// ● Llamar a la API para obtener el JWT.
// ● Persistir el JWT.
// ● Cuando exista un JWT, se debe ocultar la opción del menú que dice Iniciar
// sesión, se debe agregar una que diga Situación Chile y otra de Cerrar sesión.

const postData = async (email, password) => {
  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password }),
    });
    const { token } = await response.json();
    localStorage.setItem("jwt-token", token);
    toggleLinks();
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};
// <!-- mario -->
const toggleLinks = () => {
  $("#formModal").modal("hide");
  $("#js-link-login").toggle();
  $("#js-link-chile").toggle();
  $("#js-link-logout").toggle();
};

// 4. Al hacer click sobre la opción Situación Chile, se debe mostrar una nueva página
// donde se añadirá un gráfico y se debe ocultar el gráfico de todos los países con la
// tabla.

const handleMenu = () => {
  $("#main-section").toggle();
  $("#chile-section").toggle();
};

$("#js-link-home").on("click", (e) => {
  e.preventDefault();
  if ($("#chile-section").is(":visible")) {
    //Se agregó esta validación para evitar el link home abriera situación Chile
    handleMenu();
  }
});

$("#js-link-chile a").on("click", (e) => {
  e.preventDefault();
  getChileInfo();
  if ($("#main-section").is(":visible")) {
    //Se agregó esta validación para evitar el link Situación Chile abriera el Home
    handleMenu();
  }
});

// 5. Al hacer click en la opción Situación Chile, se debe llamar a las siguientes APIs.
// ● http://localhost:3000/api/confirmed
// ● http://localhost:3000/api/deaths
// ● http://localhost:3000/api/recovered

const getChileInfo = () => {
  const jwt = localStorage.getItem("jwt-token");
  Promise.all(
    ["http://localhost:3000/api/confirmed", "http://localhost:3000/api/deaths", "http://localhost:3000/api/recovered"].map((url) =>
      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }).then((resp) => resp.json())
    )
  )
    .then((response) => {
      drawChileChart(response);
    })
    .catch((err) => {
      console.error(err);
      localStorage.clear();
      toggleLinks();
    });
};

// 6. En un sólo gráfico de línea se debe mostrar la información obtenida de las APIs del
// punto 5.

const prepareChileChart = (data) => {
  const labels = data[0].data.map((item) => item.date);
  return {
    labels: labels,
    datasets: [
      {
        label: "Confirmados",
        borderColor: "rgb(255, 205, 86)",
        backgroundColor: "rgb(255, 205, 86)",
        fill: false,
        data: data.filter((item) => item.type === "confirmed")[0].data.map((item) => item.total),
      },
      {
        label: "Muertos",
        borderColor: "rgb(201, 203, 207)",
        backgroundColor: "rgb(201, 203, 207)",
        fill: false,
        data: data.filter((item) => item.type === "deaths")[0].data.map((item) => item.total),
      },
      {
        label: "Recuperados",
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgb(75, 192, 192)",
        fill: false,
        data: data.filter((item) => item.type === "recovered")[0].data.map((item) => item.total),
      },
    ],
  };
};

const drawChileChart = (data) => {
  const { labels, datasets } = prepareChileChart(data);
  const covidChileChart = document.getElementById("covidChileChart");
  console.log(covidChileChart);
  new Chart(covidChileChart, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets,
    },
  });
};

// 7. Al hacer click sobre el link Cerrar sesión del menú se debe volver al estado inicial de
// la aplicación, eliminar el token y ocultar los link de Situación Chile y Cerrar sesión,
// además de volver a mostrar Iniciar sesión.

$("#js-link-logout a").on("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  $("#chile-section").hide();
  $("#main-section").show();
  toggleLinks();
});

export { toggleLinks, postData };
