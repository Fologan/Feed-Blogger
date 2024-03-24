//v0.6
var Feeds = (function() {
    "use strict";

    // Define la configuración por defecto para el plugin
    const defaultSettings = {
        url: "https://www.tvimperia.com/",
        max: 4,
        direction: "column",
        background: "none",
        title: "var(--color-text)",
        category: "var(--inverse)",
        categorybg: "var(--primary)",
        border: "var(--primary)",
        label: "farandula"
    };

    // Función para obtener la URL de cada entrada del feed
    function getFeedUrl(entry) {
        for (const link of entry.link) {
            if (link.rel === "alternate") {
                return link.href;
            }
        }
    }

    // Función para obtener los datos necesarios de cada entrada del feed
    function getFeedItemData(entry, settings) {
        const title = entry.title.$t;
        const url = getFeedUrl(entry);
        let category = "No Category";
        if (entry.category && entry.category.length > 0) {
            category = entry.category[0].term;
        }
        return { title, url, category };
    }

    // Función para inyectar los estilos necesarios para el widget
    function injectStyles() {
        const style = document.createElement("style");
        style.textContent = `
            .widget-feeds {
                display: flex;
                flex-direction: ${defaultSettings.direction};
                background: ${defaultSettings.background};
                border: 1px solid ${defaultSettings.border};
                padding: 10px;
            }
            .widget-feeds a {
                text-decoration: none;
                color: ${defaultSettings.title};
            }
            .feeds-item {
                margin-bottom: 10px;
            }
            .feeds-category {
                background: ${defaultSettings.categorybg};
                color: ${defaultSettings.category};
                padding: 2px 5px;
                border-radius: 5px;
            }
        `;
        document.head.appendChild(style);
    }

    // Función para reemplazar las variables en el template del ítem del feed
    function replaceTemplateVars(template, vars) {
        return template.replace(/\{\{(.*?)\}\}/g, (_, key) => vars[key]);
    }

    // Función principal para inicializar el plugin
    function initPlugin(options) {
        const settings = Object.assign({}, defaultSettings, options);
        const container = document.querySelector(settings.container);
        if (!container) {
            console.error("Container not found");
            return;
        }

        injectStyles();

        const script = document.createElement("script");
        script.src = `${settings.url}feeds/posts/default/-/${settings.label}?alt=json-in-script&max-results=${settings.max}&callback=Feeds.displayFeed`;
        document.body.appendChild(script);

        window.Feeds = window.Feeds || {};
        window.Feeds.displayFeed = function(data) {
            const entries = data.feed.entry;
            if (!entries) {
                console.error("No entries found");
                return;
            }
            container.innerHTML = entries.map(entry => {
                const itemData = getFeedItemData(entry, settings);
                const itemTemplate = `<div class='feeds-item'>
                    <a class='feeds-link' target="_blank" href='${itemData.url}'>${itemData.title}</a>
                    <div class='feeds-category'>${itemData.category}</div>
                </div>`;
                return replaceTemplateVars(itemTemplate, itemData);
            }).join('');
        };
    }

    return { initPlugin };
})();
