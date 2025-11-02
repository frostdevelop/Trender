window.onload = function() {
    console.log("loaded")
} 
function render(inputs) {
        context.clearRect(0, 0, 700, 700);
        let matrix = inputs[0]
        let centerx = inputs[1]
        let centery = inputs[2]
        let rmatrix = Array.from(Array(matrix.length), () => new Array(2));
        for (let i = 1; i < matrix.length; i++) {
          context.beginPath();
          if (matrix[i][2] > 0) {
            var realz = matrix[i][2]/4.5+z
          }
          else {
            var realz = z+1
          }
          rmatrix[i][0] = (matrix[i][0]*10)/(realz)+centerx+(x/realz) 
          rmatrix[i][1] = (matrix[i][1]*10)/(realz)+centery+(y/realz)
          context.rect(rmatrix[i][0], rmatrix[i][1], 5, 5);
          context.fillStyle="red";
          context.fill(); 
        }
        context.font = '25px Arial';
        context.fillStyle = 'black';
        context.fillText(`X, Y, Z: ${x}, ${y}, ${z}`, 20, 30);
}
function loadmodel(text) {
  var inputArray = text.split('\n');
  var len = inputArray.length
  var modelmatrix = Array.from(Array(len), () => new Array(3));
  for (let i = 0; i < len; i++) {
       let val = inputArray[i].split(',')
       for (let o = 0; o < val.length; o++) {
         modelmatrix[i][o] = parseInt(val[o])
       }
  }
  let centerx = canvas.width/2
  let centery = canvas.height/2
  let totalx = 0
  let totaly = 0
  let count = 0
  for (let i = 1; i < modelmatrix.length; i++) {
    totalx += modelmatrix[i][0]
    totaly += modelmatrix[i][1]
    count++
  }
  centerx -= (totalx*10)/count
  centery -= (totaly*10)/count
  console.log(`${centerx}, ${centery} (${totalx*10}, ${totaly*10}), ${count}`)
  return [modelmatrix, centerx, centery]
}
async function fetchText(url) {
    let response = await fetch(url);
    return await response.text();
}
/* function loadtext(url) {
  fetch(url)
    .then( r => r.text() )
    .then( t => {loadmodel(t)})} */
document.addEventListener("keypress", function(event) {
  if (event.code == "KeyW") {
    z -= 0.1;
    (async () => {
      render(loadmodel(await fetchText('/models/cube.mx3')))
    })()
  }
  else if (event.code == "KeyS") {
    z += 0.1;
    (async () => {
      render(loadmodel(await fetchText('/models/cube.mx3')))
    })()
  }
  else if (event.code == "KeyA") {
    x += 10;
    (async () => {
      render(loadmodel(await fetchText('/models/cube.mx3')))
    })()
  }
  else if (event.code == "KeyD") {
    x -= 10;
    (async () => {
      render(loadmodel(await fetchText('/models/cube.mx3')))
    })()
  }
  else if (event.code == "Space") {
    y += 100;
    setTimeout(function(){
      y -= 25;
      (async () => {
      render(loadmodel(await fetchText('/models/cube.mx3')))
      })();
      console.log(y);
      setTimeout(function(){
      y -= 25;
      (async () => {
      render(loadmodel(await fetchText('/models/cube.mx3')))
      })();
      console.log(y);
        setTimeout(function(){
      y -= 25;
      (async () => {
      render(loadmodel(await fetchText('/models/cube.mx3')))
      })();
      console.log(y);
          setTimeout(function(){
      y -= 25;
      (async () => {
      render(loadmodel(await fetchText('/models/cube.mx3')))
      })();
      console.log(y);
    }, 100);
    }, 100);
    }, 200);
    }, 200);
  }
});

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var x = 0;
var y = 0;
var z = 0;