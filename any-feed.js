//v0.9
    function getPostLink(entry) {
        return entry.link.find(link => link.rel === 'alternate').href;
    }

    function isYoutubeUrl(url) {
        if (url == null || typeof url !== 'string') return false

        return url.includes('img.youtube.com')
    }

    function getPostImage(entry) {
        let imgUrl = entry.media$thumbnail ? entry.media$thumbnail.url : '';

        if (isYoutubeUrl(imgUrl)) {
            // Si es una URL de YouTube, cambia a una calidad de imagen mayor.
            return imgUrl.replace('default', 'mqdefault');
        } else {
            // Verifica si la URL incluye especificaciones de ancho y altura.
            const hasWidthAndHeight = /-w\d+-h\d+(-c)?/.test(imgUrl);
            if (hasWidthAndHeight) {
                // Si la URL incluye especificaciones de ancho y altura, primero elimina cualquier prefijo de tamaño (ej. "s72-"),
                // luego reemplaza con el nuevo tamaño deseado.
                imgUrl = imgUrl.replace(/s\d+-?-w\d+-h\d+(-c)?/, "-w666-h375-c");
            } else {
                // Si la URL solo incluye especificación de altura (o potencialmente ninguna), ajusta solo la altura.
                // Esto cubre los casos donde la URL es del tipo "/s72-c" o similar.
                imgUrl = imgUrl.replace(/\/s\d+(-c)?/, "/h375"); // Usa "/h375-c" para incluir recorte.
            }
            return imgUrl;
        }
    }


    async function createSection(container, tag, postCount) {
        try {
            const response = await fetch('/feeds/posts/default/-/' + tag + '?alt=json&max-results=' + postCount);

            if (!response.ok) {
                throw new Error('Error al cargar las entradas');
            }

            const data = await response.json();
            // Usa postCount para determinar cuántas entradas mostrar
            const entries = data.feed.entry

            const fragment = document.createDocumentFragment();

            entries.forEach(function (entry) {
                const title = entry.title.$t;
                const link = getPostLink(entry);
                const imageUrl = getPostImage(entry);

                // Crear un div para cada entrada
                const post = document.createElement('div');
                post.classList.add('filter-tags'); // Agrega una clase para estilizar si es necesario

                // Insertar cuerpo del post incluyendo la imagen si está disponible
                post.innerHTML = (imageUrl ? `<div class='imagen-container'><a href="${link}"><img src="${imageUrl}" alt="Portada del post"></a></div>` : '') +
                    `<div class='filter-tags-title-container'><h3 class='filter-tags-title'><a href="${link}">${title}</a></h3></div>`;

                fragment.appendChild(post);
            });

            container.appendChild(fragment);
        } catch (error) {
            console.error(error.message);
        }
    }

    const elements = document.querySelectorAll('[data-section-label]');

    elements.forEach(async function (el) {
        const category = el.dataset.sectionLabel;
        // Utiliza el valor de data-number-post o un valor predeterminado si no se proporciona
        const postCount = parseInt(el.dataset.numberPost, 10) || 9; // Usa 9 como valor predeterminado

        await createSection(el, category, postCount);
    })
