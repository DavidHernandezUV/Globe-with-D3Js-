//geo0rthographic => Uno de los muchos tipos de proyección de los datos de D3
//geoPath => pasa los valores numéricos de los arreglos a líneas
const { json, select, selectAll, geoOrthographic, geoPath, geoGraticule } = d3;

let geojson,
  globe,
  projection,
  path,
  graticule,
  infoPanel,
  isMouseDown = false,
  rotation = { x: 0, y: 0 };

// Tamaño del globo
const globeSize = {
  w: window.innerWidth / 2,
  h: window.innerHeight,
};
// Carga el archivo GeoJSON que contiene los datos de los países y llama a la función init
json("data/custom.geo.json").then((data) => init(data));

//Se llama después de cargar el archivo GeoJSON
const init = (data) => {
  geojson = data;

  drawGlobe();
  drawGraticule();
  renderInfoPanel();
  createHoverEffect();
  createDraggingEvents();
};
// Función para dibujar el globo terráqueo
const drawGlobe = () => {
  // Crea un elemento SVG y lo agrega al final del cuerpo del documento HTML
  globe = select("body")
    .append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);

  // Define la proyección del globo terráqueo utilizando la proyección ortográfica que ofrece la librería de D3.js
  projection = geoOrthographic()
    .fitSize([globeSize.w, globeSize.h], geojson) //asignar tamaño al globo
    .translate([window.innerWidth - globeSize.w / 2, window.innerHeight / 2]); //transladar
  // Crea un generador de rutas para las geometrías geográficas
  path = geoPath().projection(projection);
  // Agrega un elemento path para cada país
  globe
    .selectAll("path") //Selecciona los path
    .data(geojson.features) //añade los datos
    .enter() //entra a los datos
    .append("path") //Agrega la ruta
    .attr("d", path) // Define la ruta para cada país utilizando el generador de rutas
    .style("fill", "#33415c")
    .style("stroke", "#060a0f")
    .attr("class", "country"); // Asigna una clase CSS a cada país
};

//Meridianos y Paralelos
const drawGraticule = () => {
  // Crea un generador de geometrías geográficas para los meridianos y paralelos
  graticule = geoGraticule();

  globe
    .append("path")
    .attr("class", "graticule")
    .attr("d", path(graticule()))
    .attr("fill", "none")
    .attr("stroke", "#232323");
};

//Renderizar información del país en un article
const renderInfoPanel = () => {
  infoPanel = select("body").append("article").attr("class", "info");
};

// Función para crear el efecto hover
const createHoverEffect = () => {
  globe.selectAll(".country").on("mouseover", function (e, d) {
    //Selecciona propiedades de los datos que se quieren renderizar en el article
    const { formal_en, continent, income_grp, pop_est } = d.properties;
    // Renderiza la información del país en el panel de información
    infoPanel.html(
      `<h1>${formal_en}</h1><hr><p>Income Group: ${income_grp}</p><p>Population: ${pop_est}</p><p>Continent: ${continent}</p>`
    );
    // Cambia el color del país en el globo terráqueo
    globe
      .selectAll(".country")
      .style("fill", "#33415c")
      .style("stroke", "#060a0f");
    // Selecciona el país sobre el que se ha hecho hover y lo resalta
    select(this).style("fill", "#6ea9ff").style("stroke", "white");
  });
};

//Detecta la posición del mouse
const createDraggingEvents = () => {
  // Agrega eventos de mouse para detectar el arrastre del globo terráqueo
  globe
    .on("mousedown", () => (isMouseDown = true))
    .on("mouseup", () => (isMouseDown = false))
    .on("mousemove", (e) => {
      if (isMouseDown) {
        const { movementX, movementY } = e;

        // Actualiza la rotación del globo terráqueo en función del arrastre del mouse
        rotation.x += movementX / 3;
        rotation.y += movementY / 3;

        projection.rotate([rotation.x, rotation.y]);
        // Actualiza la posición de los países y los meridianos y paralelos en función de la nueva rotación
        selectAll(".country").attr("d", path);
        selectAll(".graticule").attr("d", path(graticule()));
      }
    });
};
