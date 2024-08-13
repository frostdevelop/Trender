window.onload = function() {
  console.log("loaded");
  let canvasElm = document.getElementById('fullview');
  canvasElm.innerHTML = '<canvas width="1600px" height="900px" id="canvasfull"></canvas><button id="closefullbutton">×<button>';
  canvasElm.className = 'fullscreen';
  canvas = document.getElementById("canvasfull");
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  centerx = canvas.width/2;
  centery = canvas.height/2;
  document.getElementById('closefullbutton').onclick = function() {
    let canvasElm = document.getElementById('fullview');
    canvasElm.innerHTML = '';
    canvasElm.className = '';
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    centerx = canvas.width/2;
    centery = canvas.height/2;
    window.removeEventListener("resize", resize);
  };
  window.addEventListener('resize', resize, false);
  startrender()
}
function deleteElm(id) {
  document.getElementById(id).remove();
}
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  centerx = canvas.width/2;
  centery = canvas.height/2;
}
function startrender() {
  looprender()
}
function looprender() {
  if (forewardkey == true) {
    x += 20*Math.sin(angle); 
    z += 20*Math.cos(angle); 
  }
  if (backkey == true) {
    x -= 20*Math.sin(angle);
    z -= 20*Math.cos(angle);
  }
  if (leftkey == true) {
    x -= 20*Math.cos(angle);
    z += 20*Math.sin(angle);
  }
  if (rightkey == true) {
    x += 20*Math.cos(angle);
    z -= 20*Math.sin(angle);
  }
  if (rleft == true) 
    angle -= 0.03;
  if (rright == true) 
    angle += 0.03;
  if (upkey == true)
    y-=20;
  if (downkey == true)
    y+=20;
  if (rup == true)
    xang += 0.03
  if (rdown == true)
    xang -= 0.03
  renderscene(cubes)
  window.requestAnimationFrame(looprender)
}

function renderscene(scene) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#696';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  let vertcount = 0;
  let edgecount = 0;
  let facecount = 0;
  facetorender = [];
  setverts = [];
  for (let i = 0; i < scene.length; i++) {
    render(scene[i][0], scene[i][1]);
    vertcount += scene[i][0]['vertexs'].length;
    edgecount += scene[i][0]['edges'].length;
    facecount += scene[i][0]['faces'].length;
  }
  renderfaces(facetorender, setverts);
  ctx.font = '25px Poppins';
  ctx.fillStyle = 'black';
  ctx.fillText(`Verts: ${vertcount}, Edges: ${edgecount}, Faces: ${facecount}`, 20, 65);
  ctx.fillText(`X: ${x.toFixed(1)}, Y: ${y.toFixed(1)}, Z: ${z.toFixed(1)}, AngleY: ${angle.toFixed(1)}, AngleX: ${xang.toFixed(1)}`, 20, 30)
};

function gravity() {
  y += 5+fallCurve;
  if (y>=0) {
    y = 0;
    fallCurve = 0;
    return
  };
  fallCurve += 5;
  setTimeout(gravity, 10)
}

function render(inputs, position=[0,0,0]) {
  const model = inputs;
  const verts = model['vertexs'];
  const edges = model['edges'];
  const faces = model['faces'];
  let rverts = Array.from(Array(verts.length), () => new Array(2));
  ctx.beginPath();
  for (let i = 0; i < verts.length; i++) {
    realz = (verts[i][2] + position[2])-z;
    realy = (verts[i][1]+position[1])-y+height
    realx = (verts[i][0] + position[0])-x;
    let rx = realx * Math.cos(-angle) + realz * Math.sin(-angle);
    let rz = realz * Math.cos(-angle) - realx * Math.sin(-angle);
    let ry = realy * Math.cos(-xang) - rz * Math.sin(-xang);
    rz = realy * Math.sin(-xang) + rz * Math.cos(-xang);
    
    if (rz < 0) {
      rz = 0;
    };
    
    rverts[i][0] = (rx/rz)*screendist+centerx;
    rverts[i][1] = (ry/rz)*screendist+centery;
    rverts[i][2] = rz;
    
    if (vertsen==true) {
    ctx.fillStyle=color;
    ctx.fillRect(rverts[i][0], rverts[i][1], 5, 5);
    }
  }
  setverts.push(rverts);
  ctx.closePath();
  if (edgesen==true) {
  ctx.beginPath();
  for (let i = 0; i < edges.length; i++) {
    ctx.moveTo(rverts[edges[i][0]][0]+2.5, rverts[edges[i][0]][1]+2.5);
    ctx.lineTo(rverts[edges[i][1]][0]+2.5, rverts[edges[i][1]][1]+2.5);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.closePath();
  }
  if (facesen==true) {
  for (let i = 0; i < faces.length; i++) {
    let totalz = 0;
    let totalnum = faces[i][0].length;
    for (let j = 0; j < totalnum; j++) {
      totalz += rverts[faces[i][0][j]][2];
    }
    let average = totalz/totalnum;
    facetorender.push([faces[i][0],average,setverts.length-1, 1])
  }
  }
}

function depthrand(rfaces, i) {
  return `rgb(${(colorraw[0])+(i*110/rfaces.length)},${(colorraw[1])+(i*110/rfaces.length)},${(colorraw[2])+(i*110/rfaces.length)})`;
}

function depthclr(rfaces, i) {
  return `rgb(${(rfaces[i][4][0])+(i*110/rfaces.length)},${(rfaces[i][4][1])+(i*110/rfaces.length)},${(rfaces[i][4][2])+(i*110/rfaces.length)})`;
}

function renderfaces(faces, rverts) {
  let rfaces = faces.sort((a,b)=>b[1]-a[1])
  for (let i = 0; i < rfaces.length; i++) {
    const startvert = rfaces[i][0][0];
    const index = rfaces[i][2];
    ctx.beginPath();
    ctx.fillStyle = depthrand(rfaces, i);
    ctx.moveTo(rverts[index][startvert][0], rverts[index][startvert][1]);
    for (let j = 1; j < rfaces[i][0].length; j++) {
      ctx.lineTo(rverts[index][rfaces[i][0][j]][0], rverts[index][rfaces[i][0][j]][1]);
    }
    ctx.closePath();
    if (outen) {
      ctx.stroke();
    };
    ctx.fill();
  }
}

document.addEventListener("keydown", (event) => {
  switch(event.keyCode) {
    case 87: {
      forewardkey = true;
      break;};
    case 83: {
      backkey = true;
      break;
    };
    case 65: {
      leftkey = true;
      break;
    };
    case 68: {
      rightkey = true;
      break;
    };
    case 81: {
      upkey = true;
      break;
    };
    case 69: {
      downkey = true;
      break;
    };
    case 32: {
      y -= 500;
      gravity();
      break;
    };
    case 37: {
      rleft = true;
      break;
    };
    case 39: {
      rright = true;
      break;
    };
    case 38: {
      rup = true;
      break;
    };
    case 40: {
      rdown = true;
      break;
    };
  };
});
document.addEventListener("keyup", (event) => {
  switch(event.keyCode) {
    case 87: {
      forewardkey = false;
      break;
    };
    case 83: {
      backkey = false;
      break;
    };
    case 65: {
      leftkey = false;
      break;
    };
    case 68: {
      rightkey = false;
      break;
    };
    case 37: {
      rleft = false;
      break;
    };
    case 39: {
      rright = false;
      break;
    };
    case 81: {
      upkey = false;
      break;
    };
    case 69: {
      downkey = false;
      break;
    };
    case 38: {
      rup = false;
      break;
    };
    case 40: {
      rdown = false;
      break;
    };
  }
});
var models = JSON.parse(`{
"cube": 
{
"version": 1.1,
"vertexs": [[-150,-150,0],[150,150,0],[-150,150,0],[150,-150,0],[-150,-150,300],[150,150,300],[-150,150,300],[150,-150,300]],
"edges": [[1,3],[0,2],[0,3],[1,2],[1,5],[2,6],[3,7],[0,4],[4,6],[4,7],[5,7],[5,6]],
"faces": [[[4,7,5,6],[255,255,255]],[[5,1,2,6],[255,255,255]],[[0,4,7,3],[255,255,255]],[[0,4,6,2],[255,255,255]],[[1,5,7,3],[255,255,255]],[[0,3,1,2],[255,255,255]]]
}, 
"pyramid": 
{
"version": 1.1,
"vertexs": [[150,150,0],[-150,150,0],[150,150,300],[-150,150,300],[0,-100,150]],
"edges": [[1,3],[0,2],[2,3],[1,0],[1,4],[2,4],[3,4],[0,4]],
"faces": [[[3,1,4],[255,255,255]],[[2,0,4],[255,255,255]],[[2,3,4]],[[1,0,4]],[[1,0,2,3]]]
}, 
"pillar": {
"version": 1.1,
"vertexs": [[-50,0,-50],[50,-1200,-50],[-50,-1200,-50],[50,0,-50],[-50,0,50],[50,-1200,50],[-50,-1200,50],[50,0,50],[-70,0,-70],[70,-20,-70],[-70,-20,-70],[70,0,-70],[-70,0,70],[70,-20,70],[-70,-20,70],[70,0,70],[-70,-1180,-70],[70,-1200,-70],[-70,-1200,-70],[70,-1180,-70],[-70,-1180,70],[70,-1200,70],[-70,-1200,70],[70,-1180,70]],
"edges": [[1,3],[0,2],[0,3],[1,2],[1,5],[2,6],[3,7],[0,4],[4,6],[4,7],[5,7],[5,6],[9,11],[8,10],[8,11],[9,10],[9,13],[10,14],[11,15],[8,12],[12,14],[12,15],[13,15],[13,14],[17,19],[16,18],[16,19],[17,18],[17,21],[18,22],[19,23],[16,20],[20,22],[20,23],[21,23],[21,22]],
"faces": [[[12,15,13,14],[255,255,255]],[[13,9,10,14],[255,255,255]],[[8,12,15,11],[255,255,255]],[[8,12,14,10],[255,255,255]],[[9,13,15,11],[255,255,255]],[[8,11,9,10],[255,255,255]],[[20,23,21,22],[255,255,255]],[[21,17,18,22],[255,255,255]],[[16,20,23,19],[255,255,255]],[[16,20,22,18],[255,255,255]],[[17,21,23,19],[255,255,255]],[[16,19,17,18],[255,255,255]],[[4,7,5,6],[255,255,255]],[[5,1,2,6],[255,255,255]],[[0,4,7,3],[255,255,255]],[[0,4,6,2],[255,255,255]],[[1,5,7,3],[255,255,255]],[[0,3,1,2],[255,255,255]]]
},
"pillar2": {
"version": 1.1,
"vertexs": [[-50,0,-50],[50,-250,-50],[-50,-250,-50],[50,0,-50],[-50,0,50],[50,-250,50],[-50,-250,50],[50,0,50],[-70,0,-70],[70,-20,-70],[-70,-20,-70],[70,0,-70],[-70,0,70],[70,-20,70],[-70,-20,70],[70,0,70],[-200,-230,-200],[200,-250,-200],[-200,-250,-200],[200,-230,-200],[-200,-230,200],[200,-250,200],[-200,-250,200],[200,-230,200]],
"edges": [[1,3],[0,2],[0,3],[1,2],[1,5],[2,6],[3,7],[0,4],[4,6],[4,7],[5,7],[5,6],[9,11],[8,10],[8,11],[9,10],[9,13],[10,14],[11,15],[8,12],[12,14],[12,15],[13,15],[13,14],[17,19],[16,18],[16,19],[17,18],[17,21],[18,22],[19,23],[16,20],[20,22],[20,23],[21,23],[21,22]],
"faces": [[[12,15,13,14],[255,255,255]],[[13,9,10,14],[255,255,255]],[[8,12,15,11],[255,255,255]],[[8,12,14,10],[255,255,255]],[[9,13,15,11],[255,255,255]],[[8,11,9,10],[255,255,255]],[[20,23,21,22],[255,255,255]],[[21,17,18,22],[255,255,255]],[[16,20,23,19],[255,255,255]],[[16,20,22,18],[255,255,255]],[[17,21,23,19],[255,255,255]],[[16,19,17,18],[255,255,255]],[[4,7,5,6],[255,255,255]],[[5,1,2,6],[255,255,255]],[[0,4,7,3],[255,255,255]],[[0,4,6,2],[255,255,255]],[[1,5,7,3],[255,255,255]],[[0,3,1,2],[255,255,255]]]
}
}`)

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var x = 0;
var y = 0;
var z = 0;
var height = 400;
var fallCurve = 0;
var url = '/models/cubes.mx3';
var version = 1.1;
var angle = 0;
var xang = 0;
var color = 'black';
var colorraw = Array.from({length: 3}, () => Math.floor(Math.random() * 90));
var cubes = [[models['cube'], [0,-400,1200]], [models['pyramid'], [0,-700,1200]], [models['pillar2'], [0,0,1350]], [models['pillar'], [700,0,0]],[models['pillar'], [-700,0,0]],[models['pillar'], [700,0,600]],[models['pillar'], [-700,0,600]],[models['pillar'], [700,0,1200]],[models['pillar'], [-700,0,1200]]];
//var cubes = [[models['pyramid'], [0,-700,1200]]]
var facesen = true;
var edgesen = false;
var vertsen = false;
var outen = false;
var screendist = 500;
var centerx = canvas.width/2;
var centery = canvas.height/2;
var forewardkey = false;
var backkey = false;
var leftkey = false;
var rightkey = false;
var rleft = false;
var rright = false;
var upkey = false;
var downkey = false;
var rup = false;
var rdown = false;
var facetorender = [];
var setverts = [];
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
  centerx = canvas.width/2;
  centery = canvas.height/2;
  document.getElementById('closefullbutton').onclick = function() {
    let canvasElm = document.getElementById('fullview');
    canvasElm.innerHTML = '';
    canvasElm.className = '';
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    centerx = canvas.width/2;
    centery = canvas.height/2;
    window.removeEventListener("resize", resize);
  };
  window.addEventListener('resize', resize, false);
};
