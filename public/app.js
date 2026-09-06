// Minimal helper utilities
const socket = io();

// Elements
const roomListEl = document.getElementById('room-list');
const globalCountEl = document.getElementById('global-count');
const myAvatarEl = document.getElementById('my-avatar');
const myNameInput = document.getElementById('my-name');
const btnChangeName = document.getElementById('btn-change-name');
const btnCreate = document.getElementById('btn-create');
const btnJoin = document.getElementById('btn-join');
const roomTitle = document.getElementById('room-title');
const roomCount = document.getElementById('room-count');
const messagesEl = document.getElementById('messages');
const msgForm = document.getElementById('msg-form');
const msgInput = document.getElementById('msg-input');
const memberList = document.getElementById('member-list');

let currentRoom = null;
let my = {name: '', avatar: ''};

function makeAvatar(seed){
  // simple colored avatar
  const hue = Math.abs(hashCode(seed)) % 360;
  return `linear-gradient(135deg,hsl(${hue} 70% 50%), hsl(${(hue+60)%360} 70% 45%))`;
}
function hashCode(s){return s.split('').reduce((a,b)=>((a<<5)-a)+b.charCodeAt(0),0);} 

function sanitizeHTML(s){
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

socket.on('connect', ()=>{
  console.log('connected');
});

socket.on('welcome', (me)=>{
  my = me;
  myNameInput.value = my.name;
  myAvatarEl.style.background = my.avatar;
});

socket.on('rooms', (rooms)=>{
  roomListEl.innerHTML='';
  rooms.forEach(r=>{
    const li=document.createElement('li');
    li.innerHTML = `<span>${sanitizeHTML(r.name)}</span><small>${r.count} online</small>`;
    li.onclick = ()=>{ joinRoom(r.name); };
    roomListEl.appendChild(li);
  });
});

socket.on('global_count', c=>globalCountEl.textContent = c);

socket.on('joined', (room, members)=>{
  currentRoom = room;
  roomTitle.textContent = room;
  roomCount.textContent = members.length + ' online';
  messagesEl.innerHTML = '';
  memberList.innerHTML = '';
  members.forEach(m=> addMember(m));
});

socket.on('room_message', (msg)=>{
  addMessage(msg);
});

socket.on('members', (members)=>{
  memberList.innerHTML='';
  members.forEach(m=> addMember(m));
  roomCount.textContent = members.length + ' online';
});

socket.on('kicked', (reason)=>{
  alert('You were kicked: '+reason);
  if(currentRoom){ currentRoom=null; roomTitle.textContent='Welcome'; messagesEl.innerHTML=''; memberList.innerHTML=''; }
});

socket.on('muted', (until)=>{
  alert('You were muted until '+new Date(until).toLocaleTimeString());
});

msgForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const text = msgInput.value.trim();
  if(!text) return;
  socket.emit('send_message', {room:currentRoom, text});
  msgInput.value='';
});

btnChangeName.addEventListener('click', ()=>{
  const name = myNameInput.value.trim();
  if(name.length<2) return alert('Name too short');
  socket.emit('change_name', name);
});

btnCreate.addEventListener('click', ()=>{
  const name = prompt('Room name (min 3 chars)');
  if(!name||name.length<3) return;
  socket.emit('create_room', {name, temporary:true}, (res)=>{
    if(res.ok){
      joinRoom(res.room);
      alert('Room created. Share code: '+res.code);
    } else alert(res.err||'Failed');
  });
});

btnJoin.addEventListener('click', ()=>{
  const code = prompt('Enter room name or code');
  if(!code) return;
  socket.emit('join_by_code', code, (res)=>{
    if(res.ok) joinRoom(res.room);
    else alert(res.err||'Failed to join');
  });
});

function joinRoom(name){
  socket.emit('join_room', name, (res)=>{
    if(!res.ok) return alert(res.err||'Could not join');
    // joined
  });
}

function addMessage(m){
  const el = document.createElement('div');
  el.className = 'msg' + (m.me?' me':'');
  el.innerHTML = `
    <div class="avatar" style="background:${m.avatar}"></div>
    <div class="bubble">
      <div class="meta"><strong>${sanitizeHTML(m.name)}</strong> · <span>${new Date(m.ts).toLocaleTimeString()}</span></div>
      <div class="text">${sanitizeHTML(m.text)}</div>
    </div>
  `;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addMember(m){
  const li = document.createElement('li');
  li.textContent = m.name + (m.owner? ' (owner)':'' ) + (m.muted? ' (muted)':'');
  memberList.appendChild(li);
}

// initial request
socket.emit('get_rooms');

// poll rooms every 8s
setInterval(()=>socket.emit('get_rooms'),8000);
