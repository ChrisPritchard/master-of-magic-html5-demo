# Master of Magic HTML5 Demo

Just a simple mockup of the main screen of [Master of Magic](https://en.wikipedia.org/wiki/Master_of_Magic), using HTML5 technologies (HTML, JS and CSS).

Has:

- a map generated using perlin noise
- a unit that can be ordered to move one tile at a time with the left mouse button (will clear fog of war)
- a working minimap that can be left/right clicked on to jump view
- background textures (the marble-ey texture) generated with perlin noise

The main map is just a massive table (60x40 cells), while the minimap uses a canvas. The textures are generally gifs used as background images.

The graphics used for the map tiles and the unit were made by me in [aseprite](https://aseprite.org/). They're shit but free under CC if anyone wants them.

For the perlin noise, I've used this chap's library: https://github.com/joeiddon/perlin.