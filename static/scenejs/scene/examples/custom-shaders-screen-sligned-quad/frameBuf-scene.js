/*
 Introductory SceneJS scene which demonstrates using the frameBuf node for render-to-texture

 More info:

 https://github.com/xeolabs/scenejs/wiki/frameBuf

 */
SceneJS.createScene({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv",

    nodes: [

        /*-------------------------------------------------------------------------------------------
         * First subgraph renders our rotating teapot, with light blue backdrop, to a texture.
         *
         * The subgraph is wrapped in an frameBuf node, which captures each frame the subgraph
         * renders and makes it available by ID as an image source for the texture node defined in the
         * second subgraph, defined further down in this example.
         *
         * The frameBuf captures the frames to a hidden frame buffer, so they will not render by
         * themselves and will only be visible via the texture.
         *
         * This example assumes that you know what the various other node types are - see the
         * other examples first if you're not sure.
         *------------------------------------------------------------------------------------------*/

        {
            type: "frameBuf",
            id: "teapot-frameBuf",

            nodes: [

                {
                    type: "lookAt",
                    eye : { x: 0.0, y: 10.0, z: -15 },
                    look : { y:1.0 },
                    up : { y: 1.0 },

                    nodes: [
                        {
                            type: "camera",
                            optics: {
                                type: "perspective",
                                fovy : 25.0,
                                aspect : 1,
                                near : 0.10,
                                far : 300.0
                            },

                            nodes: [
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 0.0, z: 1.0 }
                                },


                                /* Light blue backdrop slab
                                 */
                                {
                                    type: "material",
                                    emit: 20,
                                    baseColor:      { r: 0.0, g: 1, b:1 },
                                    specularColor:  { r: 0., g: 0., b: 1. },
                                    specular:       0.9,
                                    shine:          100.0,

                                    nodes: [
                                        {
                                            type:"translate",
                                            z:15,
                                            nodes: [
                                                {
                                                    type:"scale",
                                                    x:20,
                                                    y:20,
                                                    nodes:[
                                                        {
                                                            type : "cube"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },

                                /* Teapot, oriented with a couple of rotations
                                 */
                                {
                                    type: "rotate",
                                    id: "teapot-pitch",
                                    angle: 180.0,
                                    x : 1.0,

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "teapot-yaw",
                                            angle: 0.0,
                                            y : 1.0,

                                            nodes: [

                                                {
                                                    type: "material",
                                                    emit: 0,
                                                    baseColor:      { r: 0.5, g: 0.5, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          100.0,


                                                    nodes: [
                                                        {
                                                            type : "teapot"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        } ,
        {

            type: "shader",

            coreId: "stationary-shader",

            shaders: [

                /* Vertex shader with our custom function to intercept the matrix
                 */
                {
                    stage:  "vertex",
                    code: [

                        "mat4 myViewMatrix(mat4 m) {",
                        "   return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0); ",
                        "}",

                        "mat4 myProjMatrix(mat4 m) {",
                        "   return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0); ",
                        "}"
                    ],

                    hooks: {
                        viewMatrix: "myViewMatrix",
                        projMatrix: "myProjMatrix"
                    }
                }
            ],

            nodes: [

                {
                    type: "texture",
                    layers: [
                        {
                            frameBuf: "teapot-frameBuf",
                            applyTo:"baseColor",
                            blendMode: "multiply"
                        }
                    ],

                    nodes: [

                        /*---------------------------------------------------------------------
                         * Material properties for the quad
                         *--------------------------------------------------------------------*/
                        {
                            type: "material",
                            baseColor: { r: 1, g: 1, b: 1 },
                            specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                            emit:           1.0,
                            specular:       0.9,
                            shine:          3.0,

                            nodes: [

                                /*------------------------------------------------------
                                 * A large sphere geometry
                                 *----------------------------------------------------*/

                                        {
                                            type:"scale",
                                            x: 1,
                                            y: 1030 / 700,
                                            z: 1,

                                            nodes: [
                                                {
                                                    type: "quad"
                                                }
                                            ]
                                        }

                            ]
                        }

                    ]
                }

            ]
        }
    ]
});


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

var scene = SceneJS.scene("theScene");

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;

        //        scene.findNode("cube-yaw").set("angle", yaw);
        //        scene.findNode("cube-pitch").set("angle", pitch);

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);


/* Start rendering the scene graph. On each frame, increment the rotation
 * of the teapot.
 */

scene.start({
    idleFunc: function() {
        scene.findNode("teapot-yaw").inc("angle", 1);
        scene.findNode("teapot-pitch").inc("angle", .3);


    }
});

