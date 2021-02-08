"use strict";

let current_r = 0;
let current_g = 0;
let current_b = 0;
let color = [1,0,1];


const clientID = "clientID-" + parseInt(Math.random() * 100);
const host = 'broker.emqx.io';
const port = '8084';
// Initialize new Paho client connection
let client = new Paho.MQTT.Client(host, Number(port), clientID);





function startConnect() {
// Generate a random client ID

    // Fetch the hostname/IP address and port number from the form
    //host = document.getElementById("host").value; -->
    // port = document.getElementById("port").value; -->
    console.log("connecting")
 

    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // Connect the client, if successful, call onConnect function
    client.connect({ 
        onSuccess: onConnect,
        useSSL: true
    });

    console.info(client)
    }

    // Called when the client connects
    function onConnect() {
        // Fetch the MQTT topic from the form
        //topic = document.getElementById("topic").value;

        // Print output for the user in the messages div
        //document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + topic + '</span><br/>';

        // Subscribe to the requested topics

        console.log("subscribing");
        const  channel = "rwth/SHMviewer/#" ;
        client.subscribe(channel);
        console.log ("subscribed to "+channel);

        let iframeElement = document.getElementById("embeddedViewer");
        //console.log(iframeElement);
        let  viewer = iframeElement.contentWindow.bimViewer.viewer;

        let dam = viewer.scene.objects["20FpTZCqJy2vhVJYtjuIce"];
        dam.colorize = [0.22,0.37,0.059];

        let water_left = viewer.scene.objects["2UFCi7SOP2WBqIi4NDVGdu"];
        water_left.colorize = [0,0,0.2];
        water_left.opacity = 0.2;
        let water_mid = viewer.scene.objects["0In9GSkUj0kAjvuqTrNojT"];
        water_mid.colorize = [0,0,0.2];
        water_mid.opacity = 0.2;
        let water_right = viewer.scene.objects["1F0JmpnczAEgnqFNgI92m6"];
        water_right.colorize = [0,0,0.2];
        water_right.opacity = 0.2;

    }

    // Called when the client loses its connection
    function onConnectionLost(responseObject) {
    //    <!-- document.getElementById("messages").innerHTML += '<span>ERROR: Connection lost</span><br/>';
    //    if (responseObject.errorCode !== 0) {
    //       document.getElementById("messages").innerHTML += '<span>ERROR: ' + + responseObject.errorMessage + '</span><br/>';
    //   } -->

        console.log("connection lost")
        if (responseObject.errorCode !== 0) {
            console.log(responseObject.errorMessage);
        }
    }


// Called when a message arrives
    function onMessageArrived(message) {
        
        //JSON object with two values extracted to elementID/selObj and color 
        try {
            console.log(message.payloadString);
            let msg = JSON.parse(message.payloadString);
             //console.log(msg);
            let selObj = msg.elementID;
            let color = msg.color;
            console.log(selObj);
            console.log(color);

            //access the metaObjects array
        
            let iframeElement = document.getElementById("embeddedViewer");
            //console.log(iframeElement);
            let  viewer = iframeElement.contentWindow.bimViewer.viewer;
            console.log("selected Object:\r"+ selObj); 
            let metaObjects = viewer.metaScene.metaObjects;
            console.log (metaObjects);
            let ObjectList = Object.entries(metaObjects);
            console.log (ObjectList);
            let myItem = metaObjects[String(selObj)];
            console.log(myItem.id);
            let entity = viewer.scene.objects[myItem.id];


            entity.colorize = color;
            console.log("test")
        }
        catch (error)
        {
            console.log(error);
        }

    }

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
}

    function init() {

        startConnect();
        const iframeBaseURL = "./../app/index.html?projectId=WaterLock";
        let iframeElement = document.getElementById("embeddedViewer");
        if (!iframeElement) {
            throw "IFRAME not found";
        }
        iframeElement.src = iframeBaseURL;

        const objectIdsUsed = {};

        window.changeColorByMQTT = function (checkbox) {

                console.log(checkbox)
                let viewer = iframeElement.contentWindow.bimViewer.viewer;

                console.log(viewer.metaScene.metaObjects["12NjfiY$5BWxO3cGvRvhMM"])

                //var obj = viewer.scene.components[entity.id];
                var obj = viewer.scene.objects["12NjfiY$5BWxO3cGvRvhMM"];
                var res= obj.colorize = [1,0,0] ;
                for (selObj in viewer.scene.selectedObjects ){

                    console.log(selObj, obj);

                    viewer.scene.selectedObjects[selObj].colorize = [1,0,0];
                    viewer.scene.selectedObjects[selObj].selected = false; 
                };
                //teapotMesh.visible = false; -->
             //   material = new PhongMaterial(scene, {
             //       id: "myMaterial",
             //       diffuse: [0.2, 0.2, 1.0]
             //   })
             //   var teapotMaterial = viewer.scene.components["myMaterial"];
                var material = obj.material;
              //  teapotMesh.material = teapotMaterial;
                ///material.diffuse = [1,0,0]; // Change to red
                //obj.material = material;
                obj.meshes[0]._color=[1,0,0,0];
        }
        window.selectObject = function (checkbox) {

            const objectId = checkbox.name;

            if (checkbox.checked) {
                objectIdsUsed[objectId] = true;
            } else {
                delete objectIdsUsed[objectId];
            }

            const objectIds = Object.keys(objectIdsUsed);

            if (objectIds.length === 0) {
                iframeElement.src = iframeBaseURL + "#actions=clearFocusObjects";
            } else {
                const objectIdsParam = objectIds.join(",");
                iframeElement.src = iframeBaseURL + "#actions=focusObjects,openTab&objectIds=" + objectIdsParam + "&tabId=objects";
            }
        }

/*
        scene.input.on("mouseclicked", function (coords) {
            var hit = scene.pick({ canvasPos: coords }); if (hit) { var entity = hit.entity; var metaObject = viewer.metaScene.metaObjects[entity.id]; if (metaObject) { console.log(JSON.stringify(metaObject.getJSON(), null, "\t")); } else { const parent = entity.parent; if (parent) { metaObject = viewer.metaScene.metaObjects[parent.id]; if (metaObject) {
                            console.log(JSON.stringify(metaObject.getJSON(), null, "\t"));
                        }
                    }
                }
            }
        });
*/
    } 