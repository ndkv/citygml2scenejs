===============
CityGML2SceneJS
===============
`CityGML <http://www.citygml.org>`_ is an information model for storing 3D city models. It's encoded in XML/GML hence difficult to view and interact with. CGML2SJS's goal is to free it from its XML shackles and let you explore it freely.

The grand plan is to show the 3D geometries in your browser using WebGL. The start of this grand journey is showing the building footprints on a map. This first version of the app does just that. 

Click on the link below, pan the map and wait a sec or two for the buildings to show up. There are (only) nine neighbourhoods on the map. Try to find them all! 

**Warning!** Highly experimental. The app is a bit slow, especially when you zoom out. Try not to do that. Instead, zoom in and enjoy the vector graphics! Optimizations are on the way. Till then, enjoy! 

`Try it! <http://rotterdam.ndkv.nl>`_ 
--------------------------------------

Changelog
=========
**2012/4/11**

* Buildings are now fetched by checking whether they intersect the difference between the viewport at the start and end of a  drag event. Blog post is forthcoming.

**2012/3/30**

* Clickable buildings
* POST requests
* Client tells server which geometries are already loaded

TO DO
=====
* explain the rationale of doing this
* get a simple API up and running
* get hold of the rest of the data
* implement a smarter client side geometry requester
* implement a faster server side geometry lookup mechanism
* implement caching of geometries
* implement geometry unloading when out of view
* hide buildings when zoomed out 
* implement SceneJS
