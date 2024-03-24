//v0.5
var Feeds = function() {
  "use strict";

  // Simplificamos la expresión regular ya que solo nos enfocamos en las imágenes.
  const imageRegex = /s\d{2}(-w\d{3}-h\d{3})?(?:-c(?:-n)?)/;

  // Obtiene la URL de la entrada del feed.
  function getFeedUrl(entry) {
    for (const link of entry.link) {
      if ("alternate" === link.rel) {
        return link.href;
      }
    }
  }

  // Configuración por defecto, enfocada solo en la previsualización.
  const defaultSettings = {
    url: window.location.origin + "/",
    max: 5,
    direction: "column",
    image: "https://i.imgur.com/snnjdGS.png",
    imageSize: "w300-h240-c",
    thumbnailSize: "s80-c",
    title: "#212121",
    category: "#212121",
    categorybg: "#f1f1f1",
    border: "#e6e6e6",
    background: "#ffffff",
    label: ""
  };

  // Obtiene los datos de la entrada del feed.
  function getFeedItemData(entry, settings) {
    const content = entry.content ? entry.content.$t : entry.summary.$t;
    const category = entry.category !== null && entry.category;
    const thumbnail = entry.media$thumbnail ? entry.media$thumbnail.url : settings.image;

    return {
      url: getFeedUrl(entry),
      title: entry.title.$t,
      image: thumbnail.replace(imageRegex, settings.imageSize),
      category: category ? category[0].term : "no category"
    };
  }

  // Inicializa el plugin.
  function initPlugin(options) {
    const settings = { ...defaultSettings, ...options };
    const itemTemplate = `<div class='feeds-item'>
      <a target="_blank" href='{{url}}' class='feeds-header'>
        <img class='feeds-image' src='${settings.image}' alt='{{title}}' />
      </a>
      <div class='feeds-content'>
        <a class='feeds-category' target="_blank" href='${settings.url}search/label/{{category}}'>{{category}}</a>
        <a class='feeds-link' target="_blank" href='{{url}}'>{{title}}</a>
      </div>
    </div>`;

    const feedsContainer = document.querySelector(settings.container);
    const feedLabel = settings.label;

    // Función para cargar el script del feed.
    function loadScript(src, callback) {
      const script = document.createElement("script");
      script.src = src;
      script.onload = callback;
      document.body.appendChild(script);
    }

    // Carga el feed y procesa las entradas.
    loadScript(`${settings.url}feeds/posts/default${feedLabel ? `/-/${feedLabel}` : ""}?alt=json-in-script&max-results=${settings.max}`, function() {
      window.Feeds.callbacks = window.Feeds.callbacks || {};

      window.Feeds.callbacks[feedLabel] = function(data) {
        if (data.feed.entry && feedsContainer) {
          feedsContainer.innerHTML = "";

          data.feed.entry.forEach(entry => {
            const itemData = getFeedItemData(entry, settings);
            feedsContainer.innerHTML += itemTemplate.replace(/\{\{(.*?)\}\}/g, (_, varName) => itemData[varName] || "");
          });
        }
      };
    });
  }

  window.Feeds = window.Feeds || {};
  window.Feeds.initPlugin = initPlugin;
}();
