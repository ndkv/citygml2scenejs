===============
CityGML2SceneJS
===============
`CityGML <http://www.citygml.org>`_ is an information model for storing 3D city models. It's encoded in XML/GML hence difficult to view and interact with. CGML2SJS's goal is to free it from its XML shackles and let you explore it freely.

The grand plan is to show the 3D geometries in your browser using WebGL. The start of this grand journey is showing the building footprints on a map. This first version of the app does just that. 

Click on the link below, pan the map and wait a sec or two for the buildings to show up. There are (only) nine neighbourhoods on the map. Try to find them all! 

**Warning!** Highly experimental. The app is a bit slow, especially when you zoom out. Try not to do that. Instead, zoom in and enjoy the vector graphics! Optimizations are on the way. Till then, enjoy! 

Try it! - temporarily not working, come back tomorrow
--------------------------------------

TO DO
=====
* expalin the rationale of doing this
* get hold of the rest of the data
* implement a faster geometry lookup mechanism
* implement caching of geometries locally in JavaScript as well as on the server
* implement SceneJS
