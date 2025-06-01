const part = (value,base) => value%base ? value : part(value/base,base)
const r_earth = 6371.22
const eq_len = 2*Math.PI*r_earth
function spectrum_wn2grid(){
  const type = document.getElementById('cuttype').value;
  const wn = parseInt(document.getElementById('s_wn').value);
  if(!(wn>0)) return
  let n_T = wn
  let n_TL = Math.round(n_T*3/2)
  let i = 3*n_T+1
  let j = Math.ceil(i/2)
  switch(type){
    case "TL":
      n_TL = wn
      n_T = Math.round(n_TL*2/3)
      i = 2*n_TL+1
      j = Math.ceil(i/2)
      break;
    case "TQ":
      n_TL = wn*3/2
      n_T = Math.round(n_TL*2/3)
      i = 2*n_TL+1
      j = i
      break;
    case "T":
    case "R":
      break;
  }
  while(part(part(part(i,2),3),5) !== 1) i++
  if(j%2 !== 0) j++
  document.getElementById('s_ngrid').value = i;
  const row = document.getElementById('s_output')
  row.cells[0].innerHTML = n_T
  row.cells[1].innerHTML = n_TL
  row.cells[2].innerHTML = i
  row.cells[3].innerHTML = j
  row.cells[4].innerHTML = 360/i
  row.cells[5].innerHTML = (eq_len/i).toFixed(1)
  row.cells[6].innerHTML = (eq_len*Math.cos(30*Math.PI/180)/i).toFixed(1)
  row.cells[7].innerHTML = (eq_len*Math.cos(60*Math.PI/180)/i).toFixed(1)
}

function spectrum_grid2wn(){
  const type = document.getElementById('cuttype').value;
  const grid = parseInt(document.getElementById('s_ngrid').value);

  const n_T = Math.floor((grid-1)/3)
  const n_TL = Math.round(n_T*3/2)
  let wn = n_T
  switch(type){
    case "T":
      break;
    case "TL":
      wn = n_T*3/2
      break;
    case "TQ":
      wn = n_T*3*3/2/2
      break;
    case "R":
      wn = 2*n_T
      break;
  }
  document.getElementById('s_wn').value = Math.floor(wn);
  const row = document.getElementById('s_output')
  row.cells[0].innerHTML = n_T
  row.cells[1].innerHTML = n_TL
  row.cells[2].innerHTML = grid
  const j = Math.ceil((3*grid+1)/2)
  row.cells[3].innerHTML = j%2==0 ? j : j+1
  row.cells[4].innerHTML = (360/grid).toFixed(3)
  row.cells[5].innerHTML = (eq_len/grid).toFixed(1)
  row.cells[6].innerHTML = (eq_len*Math.cos(30*Math.PI/180)/grid).toFixed(1)
  row.cells[7].innerHTML = (eq_len*Math.cos(60*Math.PI/180)/grid).toFixed(1)
}

function cubed_sphere(){
  const ne = parseFloat(document.getElementById('ne').value);
  if(!(ne>0)) return
  const row = document.getElementById('c_output')
  row.cells[0].innerHTML = ne

  row.cells[1].innerHTML = (r_earth*Math.acos(1/3)/(3*ne)).toFixed(1)
  row.cells[2].innerHTML = (60*Math.acos(1/3)/(ne*Math.PI)).toFixed(2)

  row.cells[3].innerHTML = (eq_len/(12*ne)).toFixed(1)
  row.cells[4].innerHTML = (30/ne).toFixed(2)

  row.cells[5].innerHTML = (2*r_earth/(3*ne)*Math.sqrt(Math.PI/6)).toFixed(1)
  row.cells[6].innerHTML = (20*Math.sqrt(6/Math.PI)/ne).toFixed(2)
  row.cells[7].innerHTML = (eq_len*r_earth/(27*ne**2)).toFixed(1)
}

function icosahedral(){
  const gl = parseFloat(document.getElementById('gl').value);
  if(!(gl>=0)) return
  const row = document.getElementById('i_output')
  row.cells[0].innerHTML = gl
  row.cells[1].innerHTML = 2**gl
  const nc = 10*4**gl+2
  row.cells[2].innerHTML = nc

  row.cells[3].innerHTML = (eq_len/(5*2**gl)).toFixed(1)
  row.cells[4].innerHTML = (r_earth*Math.acos(1/Math.sqrt(5))/2**gl).toFixed(1)

  row.cells[5].innerHTML = (2*r_earth*Math.sqrt(Math.PI/nc)).toFixed(1)
  row.cells[6].innerHTML = (360/Math.sqrt(nc*Math.PI)).toFixed(1)
  row.cells[7].innerHTML = (4*Math.PI*r_earth**2/nc).toFixed(1)
}