var Feeds = function() {
  "use strict";

  // Expresión regular para detectar los tamaños de imagen en las URLs
  const imageRegex = /s\d{2}(-w\d{3}-h\d{3})?(?:-c(?:-n)?)/;

  // Función para obtener la URL del feed de un objeto de entrada
  function getFeedUrl(entry) {
    for (const link of entry.link) {
      if ("alternate" === link.rel) {
        return link.href;
      }
    }
  }

  // Configuración predeterminada
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
    label: "",
    styles: true
  };

  // Función para verificar si una URL es una imagen de YouTube
  function isYouTubeImage(url) {
    return url !== null && typeof url === "string" && url.includes("img.youtube.com");
  }

  // Función para reemplazar el tamaño de la imagen en una URL
  function replaceImageSize(url, newSize) {
    if (isYouTubeImage(url)) {
      return url.replace("default", newSize);
    } else {
      return url.replace(imageRegex, newSize);
    }
  }

  // Función para obtener los datos de una entrada de feed
  function getFeedItemData(entry, settings) {
    const content = entry.content ? entry.content.$t : entry.summary.$t;
    const category = entry.category !== null && entry.category;
    const thumbnail = entry.media$thumbnail ? entry.media$thumbnail.url : getImageFromContent(content) || settings.image;

    return {
      url: getFeedUrl(entry),
      title: entry.title.$t,
      image: replaceImageSize(thumbnail, isYouTubeImage(thumbnail) ? "mqdefault" : settings.imageSize),
      thumbnail: replaceImageSize(thumbnail, isYouTubeImage(thumbnail) ? "mqdefault" : settings.thumbnailSize),
      category: category ? category[0].term : "no category"
    };
  }

  // Función para obtener la imagen de un contenido HTML
  function getImageFromContent(content) {
    const div = document.createElement("div");
    div.innerHTML = content;
    const img = div.querySelector("img");
    return img ? img.src : "";
  }

  // Función para inicializar el plugin
  function initPlugin(options) {
    const settings = { ...defaultSettings, ...options };
    const itemTemplate = `<div class='feeds-item'>
      <a target="_blank" href='{{url}}' class='feeds-header'>
        <img class='feeds-image' src='${"column" === settings.direction ? "{{thumbnail}}" : "{{image}}"}' alt='{{title}}' />
      </a>
      <div class='feeds-content'>
        <a class='feeds-category' target="_blank" href='${settings.url}search/label/{{category}}'>{{category}}</a>
        <a class='feeds-link' target="_blank" href='{{url}}'>{{title}}</a>
      </div>
    </div>`;
    const feedsContainer = document.querySelector(".widget-feeds");
    const feedLabel = settings.label;

    // Función para cargar el script de forma asíncrona
    function loadScript(src) {
      const script = document.createElement("script");
      script.src = src;
      document.body.appendChild(script).parentNode.removeChild(script);
    }

    // Cargar el script del feed
    loadScript(`${settings.url}feeds/posts/default${feedLabel ? `/-/${feedLabel}` : ""}?alt=json-in-script&callback=ifeeds&max-results=${settings.max}`);

    // Función de devolución de llamada para procesar los datos del feed
    window.ifeeds = function(data) {
      if (data.feed.entry && feedsContainer) {
        // Aplicar estilos CSS si se solicita
        if (settings.styles) {
          injectStyles(`
            .widget-feeds {
              --feeds-margin: 1rem;
              --feeds-gap: 1.25rem;
              --feeds-border: ${settings.border};
              padding: var(--feeds-gap);
              display: flex;
              max-width: 100%;
              border: 1px solid var(--feeds-border);
              border-radius: .5rem;
              background: var(--feeds-background, ${settings.background});
            }

            .widget-feeds,
            .widget-feeds * {
              box-sizing: border-box;
            }

            .feeds-item {
              display: flex;
              align-items: flex-start;
            }

            .feeds-column,
            .feeds-row .feeds-item {
              flex-direction: column;
            }

            .feeds-column .feeds-header {
              margin-right: var(--feeds-margin);
              width: 80px;
            }

            .feeds-row .feeds-header {
              margin-bottom: var(--feeds-margin);
              width: 100%;
              --feeds-ratio-y: 9;
              --feeds-ratio-x: 16;
            }

            .feeds-header {
              flex: none;
              position: relative;
              overflow: hidden;
              border-radius: 0.5rem;
            }
            
            .feeds-header::before {
              content: "";
              display: block;
              padding-top: calc(var(--feeds-ratio-y, 1)/ var(--feeds-ratio-x, 1) * 100%);
            }
            
            .feeds-link {
              text-decoration: none;
              color: var(--feeds-title-color, ${settings.title});
              font-weight: 500;
              font-size: 1rem;
              margin-top: .5rem;
              display: block;
            }

            .feeds-category {
              text-transform: capitalize;
              text-decoration: none;
              display: inline-block;
              border-radius: 5rem;
              padding: .25rem .875rem;
              background-color: var(--feeds-category-bg, ${settings.categorybg});
              color: var(--feeds-category-color, ${settings.category});
              font-size: .875rem;
              font-weight: 400;
            }

            .feeds-image {
              object-fit: cover;
              position: absolute;
              top: 50%;
              left: 50%;
              width: 100%;
              min-height: 100%;
              transform: translate(-50%, -50%);
            }

            .feeds-column .feeds-item + * {
              margin-top: var(--feeds-gap);
              padding-top: var(--feeds-gap);
              border-top: 1px solid var(--feeds-border);
            }

            .feeds-row .feeds-item + * {
              margin-left: var(--feeds-gap);
            }

            .feeds-row {
              overflow-x: auto;
            }

            .feeds-row .feeds-item {
              flex: 1 1 100%;
              min-width: 250px;
            }

            .feeds-row .feeds-content {
              text-align: center;
              width: 100%;
            }
          `);
        }

        // Configurar el contenedor de feeds
        feedsContainer.className = `widget-feeds feeds-${settings.direction}`;
        feedsContainer.innerHTML = "";

        // Renderizar las entradas de feed
        data.feed.entry.forEach(entry => {
          const itemData = getFeedItemData(entry, settings);
          feedsContainer.innerHTML += replaceTemplateVars(itemTemplate, itemData);
        });
      }
    };
  }

  // Función para inyectar estilos CSS
  function injectStyles(css) {
    const styleElement = document.getElementById("widget-feeds");
    if (styleElement) {
      styleElement.remove();
    }
    css = css.replace(/\s+/g, " ").replace(/\s*([:;{},])\s*/g, "$1").trim();
    const style = document.createElement("style");
    style.id = "widget-feeds";
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Función para reemplazar variables en una plantilla
  const replaceTemplateVars = (template, vars) => {
    return template.replace(/\{\{(.*?)\}\}/g, (match, varName) => vars[varName]);
  };

  // Elementos del DOM para la personalización
  const resultElement = document.getElementById("dev-results");
  const customizerElement = document.getElementById("dev-customizer");

  // Función para mostrar un mensaje temporal
  const showTemporaryMessage = (element, message) => {
    if (element) {
      element.classList.add("copied");
      element.innerText = message.action;
      if (element.timeoutId) {
        clearTimeout(element.timeoutId);
      }
      element.timeoutId = setTimeout(function() {
        element.classList.remove("copied");
        element.innerText = message.original;
        element.timeoutId = null;
      }, 2000);
    }
  };

  // Función para inicializar el personalizador
  function initCustomizer(options) {
    const settings = { ...defaultSettings, ...options };

    if (!resultElement || !customizerElement) {
      return;
    }

    const resultTextarea = resultElement.querySelector("textarea");
    const copyButton = resultElement.querySelector("button");
    const originalButtonText = copyButton.innerText;

    function updateResult(textarea, settings) {
      textarea.value = `<div class="widget-feeds"></div>
<script src='https://cdn.jsdelivr.net/npm/ifeeds@1/dist/js/feeds.min.js'></script>
<script>Feeds.initPlugin({
  max: ${settings.max}, direction: '${settings.direction}', background: '${settings.background}', title: '${settings.title}', category: '${settings.category}', categorybg: '${settings.categorybg}', border: '${settings.border}', url: '${settings.url}', label: '${settings.label}'
})</script>`;
    }

    copyButton.onclick = () => {
      navigator.clipboard.writeText(resultTextarea.value).then(function() {
        showTemporaryMessage(copyButton, { action: "Código copiado!", original: originalButtonText });
      });
    };

    initPlugin(settings);
    updateResult(resultTextarea, settings);

    Array.from(customizerElement.querySelectorAll("input")).forEach(input => {
      input.addEventListener("input", event => {
        settings[event.target.name] = event.target.value;
        initPlugin(settings);
        updateResult(resultTextarea, settings);
      });
    });
  }

  return {
    initPlugin,
    initCustomizer
  };
}();
