//TODO: Add projection matrix
//TODO: Add scene file format
//TODO: Fix scene format to use universal vertex list
let models;
var canvas = document.getElementById("canvas");
const canvasElm = document.getElementById('fullview');
var ctx = canvas.getContext("2d");
const fovElm = document.getElementById('tr-fov');
const faceChk = document.getElementById('tr-facechk');
const vertChk = document.getElementById('tr-vertchk');
const statChk = document.getElementById('tr-statchk');
let x = 0;
let y = 0;
let z = 0;
var height = 2.5;
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;
let canvasAspect = canvasHeight/canvasWidth;
var fallCurve = 0;
var url = './models/Test.obj';
var version = 1.1;
let yang = 0;
let xang = 0;
let tnxang = Math.tan(xang);
var color = 'black';
var colorraw = Array.from({length: 3}, () => Math.floor(Math.random() * 90));
let cubes;
let facesen = true;
let statsen = true;
let vertsen = false;
var outen = false;
var screendist = 0.5;
//const gravityForce = 0.05;
let playerSpeed = 0.25;
let centerx = canvas.width/2;
let centery = canvas.height/2;
let forewardkey = false;
let backkey = false;
let leftkey = false;
let rightkey = false;
let rleft = false;
let rright = false;
let upkey = false;
let downkey = false;
let rup = false;
let rdown = false;
let gravity = false;
var facetorender = [];
var setverts = [];
let cursorX = 0;
let cursorY = 0;
let someVar = Math.tan(1.57079632679*screendist);
const text = `Loading [${url}]`;

let sphereForce = [0,0,0];
let sphereVelocity = [0,0,0];

fetch(url).then(async e=>{
  console.log('MODEL LOADED');
  models = loadObj(await e.text());
  cubes = [
    [models.get('Text'),[0,5,10],[2,2,2],[0,0,0]],
    [models.get('Teapot'),[0,0,10],[1,1,1],[0,0,0]],
    [models.get('Sphere'),[0,10,5],[1,1,1],[0,0,0]],
    [models.get('Pyramid'),[0,0,-10],[1,1,1],[0,0,0]],
    [models.get('Pillar'),[-5,0,10],[1,1,1],[0,0,0]],
    [models.get('Pillar'),[5,0,10],[1,1,1],[0,0,0]],
    [models.get('Pillar'),[-5,0,-10],[1,1,1],[0,0,0]],
    [models.get('Pillar'),[5,0,-10],[1,1,1],[0,0,0]],
    [models.get('Pillar'),[-5,0,0],[1,1,1],[0,0,0]],
    [models.get('Pillar'),[5,0,0],[1,1,1],[0,0,0]]
  ];
  startrender();
});
function loadObj(s,f='object.obj') {
  const objects = new Map;
  const lines = s.split('\n');
  let tempData = [[],[]];
  let previousVert = 0;
  let currentObj = f.substr(0,f.length-4);
  for(const line of lines){
    const lineSplit = line.split(' ');
    switch(lineSplit[0]){
      case 'o':
        previousVert += tempData[0].length;
        objects.set(currentObj,tempData);
        currentObj = line.substr(2);
        tempData = [[],[]];
        break;
      case 'v':
        const vert = new Array(3);
        vert[0] = parseFloat(lineSplit[1]);
        vert[1] = parseFloat(lineSplit[2]);
        vert[2] = -parseFloat(lineSplit[3]);
        tempData[0].push(vert);
        break;
      case 'f':
        const face = [[],[],[]];
        for(let i=1;i<lineSplit.length;i++){
          const faceParams = lineSplit[i].split('/');
          for(let j=0;j<faceParams.length;j++){
            face[j].push(parseInt(faceParams[j])-1-previousVert);
          }
        }
        tempData[1].push(face);
        break;
      /*
      case 'vn':

        break;
      case 'vt':

        break;
      */
    }
  }
  objects.set(currentObj,tempData);
  return objects;
}
function deleteElm(id) {
  document.getElementById(id).remove();
}
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  centerx = window.innerWidth/2;
  centery = window.innerHeight/2;
  canvasHeight = window.innerHeight;
  canvasWidth = window.innerWidth;
  canvasAspect = canvasHeight/canvasWidth;
}
function startrender() {
  looprender();
}
function looprender() {
  if (forewardkey) {
    x += playerSpeed*Math.sin(yang); 
    z += playerSpeed*Math.cos(yang); 
  }
  if (backkey) {
    x -= playerSpeed*Math.sin(yang);
    z -= playerSpeed*Math.cos(yang);
  }
  if (leftkey) {
    x -= playerSpeed*Math.cos(yang);
    z += playerSpeed*Math.sin(yang);
  }
  if (rightkey) {
    x += playerSpeed*Math.cos(yang);
    z -= playerSpeed*Math.sin(yang);
  }
  if (rleft) 
    yang -= 0.03;
  if (rright) 
    yang += 0.03;
  if (upkey)
    y-=playerSpeed;
  if (downkey)
    y+=playerSpeed;
  if (rup)
    xang -= 0.03,tnxang = -Math.tan(xang);
  if (rdown)
    xang += 0.03,tnxang = -Math.tan(xang);
  if(gravity){
    y -= fallCurve;
    fallCurve += 0.03;
    y<=0 && (fallCurve=-(fallCurve/1.8));
    Math.abs(fallCurve)<=0.1 && Math.abs(y)<=0.1 && (gravity=false,y=0);
  }
  cursorY != 0 && (xang+=cursorY/100) && (tnxang = -Math.tan(xang)) && (cursorY = 0);
  yang+=cursorX/100;
  cursorX = 0;
  renderscene(cubes)
  animate(cubes)
  window.requestAnimationFrame(looprender)
}
function vectorDistance(v1,v2){
  return Math.sqrt(Math.pow(v1[0]-v2[0],2)+Math.pow(v1[1]-v2[1],2)+Math.pow(v1[2]-v2[2],2));
}
function rotateVert(vert,xang,yang){
  vert = [vert[0] * np.cos(yang) + vert[2] * np.sin(yang), vert[1], vert[2] * np.cos(yang) - vert[0] * np.sin(yang)];
  vert = [vert[0], vert[1] * np.cos(xang) - vert[2] * np.sin(xang), vert[1] * np.sin(xang) + vert[2] * np.cos(xang)];
  return vert;
}
function animate(scene){
  //const mass = 1;
  sphereForce[0] = -sphereVelocity[0]/50;
  sphereForce[1] = -0.01-sphereVelocity[1]/50;
  sphereForce[2] = -sphereVelocity[2]/50;
  scene[2][1][1] <= 1 && (scene[2][1][1] = 1,sphereForce[1] = -sphereVelocity[1]*0.75,sphereVelocity[1] = 0,sphereForce[1]<=0.03 && (sphereForce[1]=0));
  if(vectorDistance(scene[2][1],[x,scene[2][1][1],z]) <= 1.5){
    const direction = [scene[2][1][0]-x,scene[2][1][1]-(y+0.4),scene[2][1][2]-z];
    const distance = vectorDistance(direction,[0,0,0]);
    const normal = [direction[0]/distance,direction[1]/distance,direction[2]/distance];
    sphereForce[0] = normal[0]/50;
    sphereForce[1] = normal[1]/50;
    sphereForce[2] = normal[2]/50;
  }
  sphereVelocity[0] += sphereForce[0];
  sphereVelocity[1] += sphereForce[1];
  sphereVelocity[2] += sphereForce[2];
  scene[2][1][0] += sphereVelocity[0];
  scene[2][1][1] += sphereVelocity[1];
  scene[2][1][2] += sphereVelocity[2];
  scene[2][2][0] = 1+sphereVelocity[0];
  scene[2][2][1] = 1+sphereVelocity[1];
  scene[2][2][2] = 1+sphereVelocity[2];

  scene[3][1][1] = (Math.sin(Date.now()/1000)*5)+5.5;
  scene[3][3][1] += 0.01;
  scene[0][3][0] += 0.1;
}
function renderscene(scene) {
  ctx.clearRect(0, 0, canvas.width,canvasHeight);
  ctx.fillStyle = '#00aeff';
  ctx.fillRect(0,0,canvas.width,canvasHeight);
  ctx.fillStyle = '#696';
  const gpos = centery+centery*tnxang*someVar+y*canvasHeight/100; //(1*screendist-Math.cos(xang*2))*centery xang*canvasHeight*screendist
  ctx.fillRect(0,gpos,canvas.width,canvasHeight-gpos);
  let vertcount = 0;
  let facecount = 0;
  facetorender = [];
  setverts = [];
  for (let i = 0; i < scene.length; i++) {
    render(scene[i][0],scene[i][1],scene[i][2],scene[i][3]);
    vertcount += scene[i][0][0].length;
    facecount += scene[i][0][1].length;
  }
  renderfaces(facetorender, setverts);
  if(statsen)
    ctx.font = '25px Poppins',
      ctx.fillStyle = 'black',
      ctx.fillText(`Verts: ${vertcount}, Faces: ${facecount}`, 20, 65),
      ctx.fillText(`X: ${x.toFixed(1)}, Y: ${y.toFixed(1)}, Z: ${z.toFixed(1)}, AY: ${yang.toFixed(1)}, AX: ${xang.toFixed(1)}, V: ${fallCurve.toFixed(1)}`, 20, 30);
};

function render(inputs,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0]) {
  const model = inputs;
  const verts = model[0];
  const faces = model[1];
  let rverts = Array.from(Array(verts.length), () => new Array(3));
  ctx.beginPath();
  for (let i = 0; i < verts.length; i++) {
    let nv = [verts[i][0]*scale[0],verts[i][1]*scale[1],verts[i][2]*scale[2]];
    (rotation[0] != 0 || rotation[1] != 0) && (nv = [nv[0] * Math.cos(rotation[1]) + nv[2] * Math.sin(rotation[1]), nv[1], nv[2] * Math.cos(rotation[1]) - nv[0] * Math.sin(rotation[1])],nv = [nv[0], nv[1] * Math.cos(rotation[0]) - nv[2] * Math.sin(rotation[0]), nv[1] * Math.sin(rotation[0]) + nv[2] * Math.cos(rotation[0])]);
    const realz = ((nv[2]+position[2])-z)*canvasHeight;
    const realy = (-(nv[1]+position[1]-y)+height)*canvasHeight;
    const realx = ((nv[0]+position[0])-x)*canvasHeight;
    const rx = realx * Math.cos(-yang) + realz * Math.sin(-yang);
    let rz = realz * Math.cos(-yang) - realx * Math.sin(-yang);
    const ry = realy * Math.cos(xang) - rz * Math.sin(xang);
    rz = realy * Math.sin(xang) + rz * Math.cos(xang);
    rz < 0 && (rz = 0);
    rverts[i][0] = (rx/rz)*screendist*canvasHeight+centerx;
    rverts[i][1] = (ry/rz)*screendist*canvasHeight+centery;
    rverts[i][2] = rz;
    if(vertsen)
      ctx.fillStyle=color,
        ctx.fillRect(rverts[i][0], rverts[i][1], 5, 5);
  }
  setverts.push(rverts);
  ctx.closePath();
  if (facesen) {
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
  const rfaces = faces.sort((a,b)=>b[1]-a[1])
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
  case 87:
    forewardkey = true;
    break;
  case 83:
    backkey = true;
    break;
  case 65:
    leftkey = true;
    break;
  case 68:
    rightkey = true;
    break;
  case 81:
    upkey = true;
    break;
  case 69:
    downkey = true;
    break;
  case 32:
    fallCurve=-0.5;
    gravity=true;
    break;	
  case 37:
    rleft = true;
    break;
  case 39:
    rright = true;
    break;
  case 38:
    rup = true;
    break;
  case 40:
    rdown = true;
    break;
  };
});
document.addEventListener("keyup", (event) => {
  switch(event.keyCode) {
    case 87:
      forewardkey = false;
      break;
    case 83:
      backkey = false;
      break;
    case 65:
      leftkey = false;
      break;
    case 68:
      rightkey = false;
      break;
    case 37:
      rleft = false;
      break;
    case 39:
      rright = false;
      break;
    case 81:
      upkey = false;
      break;
    case 69:
      downkey = false;
      break;
    case 38:
      rup = false;
      break;
    case 40:
      rdown = false;
      break;
  }
});
function mouseMovement(e){
  document.pointerLockElement === e.target && (cursorX = e.movementX,cursorY = e.movementY);
}
function lockRequest(e){
  e.target.requestPointerLock();
}
canvas.addEventListener('mousemove',mouseMovement);
canvas.addEventListener('click',lockRequest);
canvasElm.addEventListener('click',lockRequest);
canvasElm.addEventListener('mousemove',mouseMovement);
ctx.font = '25px Arial';
ctx.fillStyle = 'black';
ctx.fillText(text, (canvas.width/2)-text.length*6, (canvas.height/2)-25);
fovElm.value = screendist.toString();
fovElm.addEventListener('input',()=>screendist=fovElm.value,someVar=Math.tan(1.57079632679*screendist));
faceChk.checked = facesen;
vertChk.checked = vertsen;
statChk.checked = statsen;
faceChk.addEventListener('change',()=>facesen=!facesen);
vertChk.addEventListener('change',()=>vertsen=!vertsen);
statChk.addEventListener('change',()=>statsen=!statsen);
document.getElementById('fullbutton').onclick = function() {
  canvasElm.innerHTML = '<canvas width="1600px" height="900px" id="canvasfull"></canvas><button id="closefullbutton">×<button>';
  canvasElm.className = 'fullscreen';
  canvas = document.getElementById("canvasfull");
  ctx = canvas.getContext("2d");
  resize();
  document.getElementById('closefullbutton').onclick = function() {
    canvasElm.innerHTML = '';
    canvasElm.className = '';
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    centerx = canvas.width/2;
    centery = canvas.height/2;
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;
    canvasAspect = canvasHeight/canvasWidth;
    window.removeEventListener("resize", resize);
  };
  window.addEventListener('resize', resize, false);
};
