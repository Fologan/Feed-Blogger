
>  *Esta es la versión 1 | Feed-Blogger v1.0*


## Instalación

### Paso 1
Si tienes la oportunidad de poner el siguiente código dentro de un widget arriba del todo sin necesidad de entrar a "Editar HTML" hazlo, es la manera más fácil y segura, para no afectar tu plantilla de Blogger de lo contrario pega el siguiente código antes de la etiqueta  `</head>` : [Clic para ver imagen de referencia](https://github.com/Fologan/Feed-Blogger?tab=readme-ov-file#imagen-referencia-para-paso-1)


```
<script src="https://cdn.jsdelivr.net/gh/Fologan/Feed-Blogger@main/any-feed.js" defer></script>
```

### Paso 2
De igual manera si tienes la posibilidad de pegar este código en un widget en el footer como ultimo widget de toda la página estaría perfecto, sino, buscamos la etiqueta `</body>` y justo por encima, pegamos el código. [Clic para ver imagen de referencia](https://github.com/Fologan/Feed-Blogger?tab=readme-ov-file#imagen-referencia-para-paso-2)



```
<script>
document.addEventListener("DOMContentLoaded", () => {
  if (typeof window["createSection"] !== "undefined") {
    const bs = createSection;
    bs.init();
  }
});
</script>
```

### Paso 3
Por último, siéntete libre de pegar el código que llamará a tus secciones por etiqueta en donde quieras el código es el siguiente y lo comentaremos en seguida:


```
<div data-section-label="ETIQUETA" data-number-post="3"></div>
```

En donde `data-section-label` es la etiqueta que se busca filtrar y `data-number-post` es el número de post que quieres que se muestren por sección.

## Ejemplos
Un caso de uso sería el siguiente:
<br>
<img src="image/Captura de pantalla 2024-03-31 130752.png">

La etiqueta en este caso es "famosos" y muestran "3" post


Otro caso sería el siguiente:
<br>
<img src="image/Captura de pantalla 2024-03-31 132045.png">

En este caso el título a su vez es un enlace a todas las entradas con esa etiqueta `<a href="/search/label/juegos">🎮👾 Juegos</a>` incluso si tu plantilla te lo permite puedes usar sufijos de URL para optimizar el resultado, tales como `<a href="/search/label/juegos?max-results=12">🎮👾 Juegos</a>` el cual (en mi caso) muestra un máximo de 12 resultados por página.


###### Imagen Referencia para paso 1:
<br>
<img src="image/Captura de pantalla 2024-03-31 124936.png">

###### Imagen Referencia para paso 2:
<br>
<img src="image/Captura de pantalla 2024-03-31 125813.png">
<br><br>
Un agradecimiento a Daniel de [ZKreations.com/](https://www.zkreations.com/) que me ayudó a mejorar sustancialmente el código.
