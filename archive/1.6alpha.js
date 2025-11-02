window.onload = function() {
  console.log("loaded");
  startrender()
} 
function deleteElm(id) {
  let contents = document.getElementById(id).parentNode
  document.getElementById(id).parentNode.removeChild(document.getElementById(id));
}
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
async function fetchJson(url) {
    const response = await fetch(url);
    return await response.text();
}
async function fetchJson(url) {
    const response = await fetch(url);
    return await response.json();
}
function startrender() {
  looprender()
}
function looprender() {
  renderscene(cubes)
  window.requestAnimationFrame(looprender)
}
function renderscene(scene) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#696';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  let verts = 0;
  let edges = 0;
  let faces = 0;
  for (let i = 0; i < scene.length; i++) {
    render(loadmodel(scene[i][0]), scene[i][1]);
    verts += scene[i][0]['vertexs'].length;
    edges += scene[i][0]['edges'].length;
    faces += scene[i][0]['faces'].length;
  }
  ctx.font = '25px Poppins';
  ctx.fillStyle = 'black';
  ctx.fillText(`Verts: ${verts}, Edges: ${edges}, Faces: ${faces}`, 20, 65);
  ctx.fillText(`X: ${x.toFixed(1)}, Y: ${y.toFixed(1)}, Z: ${z.toFixed(1)}`, 20, 30);
};
function gravity() {
  y += 1+fallCurve;
  if (y>=0) {
    y = 0;
    fallCurve = 0;
    return
  };
  fallCurve += 2;
  console.log(fallCurve)
  setTimeout(gravity, 50)
}
function loadmodel(json, old=false) {
  if (json['version'] != version) {
    console.log('Error: Outdated File')
    return 'Error: Outdated File'
  }
  let centerx = canvas.width/2
  let centery = canvas.height/2
  let totalx = 0
  let totaly = 0
  let count = 0
  for (let i = 0; i < json['vertexs'].length; i++) {
    totalx += json['vertexs'][i][0]
    totaly += json['vertexs'][i][1]
    count++
  }
  centerx -= totalx/count
  centery -= totaly/count
  console.log(`${centerx}, ${centery} (${totalx}, ${totaly}), ${count}`)
  if (old) {
    return [json['vertexs'], centerx, centery]
  }
  return [json, [centerx, centery]]
}

function render(inputs, position=[0,0,0]) {
  const model = inputs[0];
  const verts = model['vertexs'];
  const edges = model['edges'];
  const faces = model['faces'];
  const color = 'black';
  const centerx = inputs[1][0];
  const centery = inputs[1][1];
  let rverts = Array.from(Array(verts.length), () => new Array(2));
  ctx.beginPath();
  for (let i = 0; i < verts.length; i++) {
    realz = verts[i][2] + z + position[2];
    if (realz < 0) {
      realz = 0;
    };
    rverts[i][0] = ((((verts[i][0]+position[0])-x)*screendist)/realz)+centerx;
    rverts[i][1] = ((((verts[i][1]+position[1])-y)*screendist)/realz)+centery;
    /*
    ctx.fillStyle=color;
    ctx.fillRect(rverts[i][0], rverts[i][1], 5, 5);
    */
  }
  ctx.closePath();
  
  ctx.beginPath();
  for (let i = 0; i < edges.length; i++) {
    ctx.moveTo(rverts[edges[i][0]][0]+2.5, rverts[edges[i][0]][1]+2.5);
    ctx.lineTo(rverts[edges[i][1]][0]+2.5, rverts[edges[i][1]][1]+2.5);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;z===
    ctx.stroke();
  }
  ctx.closePath();
  
  for (let i = 0; i < faces.length; i++) {
    ctx.beginPath();
    ctx.fillStyle=`rgb(${i*255/faces.length},${i*255/faces.length},${i*255/faces.length})`;
    ctx.moveTo(rverts[faces[i][0]][0]+2.5, rverts[faces[i][0]][1]+2.5);
    for (let j = 1; j < faces[i].length; j++) {
      ctx.lineTo(rverts[faces[i][j]][0]+2.5, rverts[faces[i][j]][1]+2.5);
    }
    ctx.closePath();
    ctx.fill();
  }
}
document.addEventListener("keypress", function(event) {
  if (event.code == "KeyW") {
    z -= 10;
  }
  else if (event.code == "KeyS") {
    z += 10;
  }
  else if (event.code == "KeyA") {
    x -= 10;
  }
  else if (event.code == "KeyD") {
    x += 10;
  }
  else if (event.code == "KeyQ") {
    y -= 10;
  }
  else if (event.code == "KeyE") {
    y += 10;
  }
  else if (event.code == "Space") {
    y -= 200;
    gravity()
  }
  else if (event.code == "ArrowLeft") {
    angle += -5;
  }
  else if (event.code == "ArrowRight") {
    angle += 5;
  }
});
var models = JSON.parse('{"model": {"version": 1.1,"vertexs": [[-100,-100,-50],[100,100,-50],[-100,100,-50],[100,-100,-50],[-100,-100,50],[100,100,50],[-100,100,50],[100,-100,50]],"edges": [[1,3],[0,2],[0,3],[1,2],[1,5],[2,6],[3,7],[0,4],[4,6],[4,7],[5,7],[5,6]],"faces": [[4,7,5,6],[5,1,2,6],[0,4,7,3],[0,4,6,2],[1,5,7,3],[0,3,1,2]]}, "model2": {"version": 1.1,"vertexs": [[-50,-50,-25],[50,50,-25],[-50,50,-25],[50,-50,-25],[-50,-50,25],[50,50,25],[-50,50,25],[50,-50,25]],"edges": [[1,3],[0,2],[0,3],[1,2],[1,5],[2,6],[3,7],[0,4],[4,6],[4,7],[5,7],[5,6]],"faces": [[4,7,5,6],[5,1,2,6],[0,4,7,3],[0,4,6,2],[1,5,7,3],[0,3,1,2]]}, "pillar": {"version": 1.1,"vertexs": [[-25,-25,-12.5],[25,25,-12.5],[-25,25,-12.5],[25,-25,-12.5],[-25,-25,12.5],[25,25,12.5],[-25,25,12.5],[25,-25,12.5]],"edges": [[1,3],[0,2],[0,3],[1,2],[1,5],[2,6],[3,7],[0,4],[4,6],[4,7],[5,7],[5,6]],"faces": [[4,7,5,6],[5,1,2,6],[0,4,7,3],[0,4,6,2],[1,5,7,3],[0,3,1,2]]}}')

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var x = 0;
var y = 0;
var z = 0;
var fallCurve = 0;
var url = '/cubes.mx3';
var version = 1.1;
var angle = 0;
var cubes = [[models['model'], [-100,-200,0]], [models['pillar'], [200,0,200]]];
var screendist = 300;
const text = `Loading [${url}]`;
ctx.font = '25px Arial';
ctx.fillStyle = 'black';
ctx.fillText(text, (canvas.width/2)-text.length*6, (canvas.height/2)-25);

document.getElementById('fullbutton').onclick = function() {
  let canvasElm = document.getElementById('fullview');
  canvasElm.innerHTML = '<canvas width="1600px" height="900px" id="canvasfull"></canvas><button id="closefullbutton">×<button>';
  canvasElm.className = 'fullscreen';
  canvas = document.getElementById("canvasfull");
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.getElementById('closefullbutton').onclick = function() {
    let canvasElm = document.getElementById('fullview');
    canvasElm.innerHTML = '';
    canvasElm.className = '';
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    window.removeEventListener("resize", resize);
  };
  window.addEventListener('resize', resize, false);
};