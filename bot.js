var firstDiv = document.createElement("div")
firstDiv.style = 'position: absolute; top: 7%; left: 7%; height: 25%; width: 20%; border-radius: 8px; background: #0000008a; z-index: 300;'
var css =

`<input id="xx" type="number" placeholder="x" style="position: absolute; top: 4%; left: 4%; width: 35%; text-align: center; border: 1px solid black; background: white;"> <input id="yy" type="number" placeholder="y" style="position: absolute; top: 4%; left: 40%; width: 35%; text-align: center; border: 1px solid black; background: white;">
<input id="xx2" type="number" placeholder="w" style="position: absolute; top: 20%; left: 4%; width: 35%; text-align: center; border: 1px solid black; background: white;"> <input id="yy2" type="number" placeholder="h" style="position: absolute; top: 20%; left: 40%; width: 35%; text-align: center; border: 1px solid black; background: white;">
<input id="cc" type="number" placeholder="color" style="position: absolute; top: 20%; right: 2%; text-align: center; border: 1px solid black; background: white;">
<input id="fileToLoad" type="file" accept="image/*" style="position: absolute; top: 54%; left: 4%; width: 91.5%; border: 0px; color: white;">
<button id="start" style="position: absolute; bottom: 5%; left: 5%; font-size: 16px; padding: 4px;">Start</button>
<input id="pastee" checked="true" title="Set bot mode to paste" type="checkbox" style="-webkit-appearance: auto; position: absolute; height: 15%; bottom: 10%; right: 42%;">
<input id="filll" title="Set bot mode to fill" type="checkbox" style="-webkit-appearance: auto; position: absolute; height: 15%; bottom: 10%; right: 12%;">
<p style="position: absolute; bottom: 10%; right: 32%; font-family: Consolas; color: white;">Paste</p>
<p style="position: absolute; bottom: 10%; right: 5%; font-family: Consolas; color: white;">Fill</p>`;

firstDiv.innerHTML = css;
document.body.appendChild(firstDiv)

let pixelStack = [], started = false;
let index = 0, placed = 0, fill = false, paste = true, total = 0;
let wi = 0, he = 0;

let start = document.getElementById("start")
let xx = document.getElementById("xx"), yy = document.getElementById("yy");
let xx2 = document.getElementById("xx2"), yy2 = document.getElementById("yy2");
let cc = document.getElementById("cc")
let ctxx;
let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

let check1 = document.getElementById("filll");
let check2 = document.getElementById("pastee");

check1.oninput = () => {
    check2.checked = false;
    fill = true;
    paste = false;
}

check2.oninput = () => {
    check1.checked = false;
    fill = false;
    paste = true;
}
let ws = new WebSocket((localStorage.server || 'wss://server.rplace.tk:443') + (localStorage.vip ? "/" + localStorage.vip : ""))
			ws.onmessage = async function({data}){
				delete sessionStorage.err;
				data = new DataView(await data.arrayBuffer())
				let code = data.getUint8(0)
				if(code == 1){
					CD = data.getUint32(1) * 1000
				}else if(code == 2){
					//run length coding
					if(!load)load = data
					else runLengthChanges(data)
				}else if(code == 7){
					CD = data.getUint32(1) * 1000
					seti(data.getUint32(5), data.getUint8(9))
				}else if(code == 6){
					let i = 0
					while(i < data.byteLength - 2){
						seti(data.getUint32(i += 1), data.getUint8(i += 4))
					}
				}else if(code == 3){
					online = data.getUint16(1)
					document.getElementById("onlineCounter").textContent = online;
				}else if(code == 15){
					let txt = censor(decoder.decode(new Uint8Array(data.buffer).slice(1))).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
					let name;
					let messageChannel;
					[txt, name, messageChannel] = txt.split("\n")
					if(name)name = name.replace(/\W+/g,'').toLowerCase()
					let bannedNames = ["nors", "ehe", "burack", "alidark", "thedeath"]
					bannedNames.forEach(bname => {
						if (name == bname) return;
					})
					
					if(!txt)return
					if(txt.includes("𝚍𝚒𝚜𝚌𝚘𝚛𝚍.𝚐𝚐"))return
					if(txt.includes("𝐝𝐢𝐬𝐜𝐨𝐫𝐝.𝐠𝐠"))return
					if(txt.includes("discord.gg"))return
					if(txt.includes("𝙙𝙞𝙨𝙘𝙤𝙧𝙙.𝙜𝙜"))return
					if(txt.includes("𒐫"))return
					
					let newMessage = document.createElement("div")
					newMessage.innerHTML = `<span style="color: ${CHAT_COLOURS[name ? hash(name) & 7 : (Math.round(Math.random() * 8))]}; cursor: pointer;" onclick="chatMentionUser(this.textContent);">[${name || "anon"}]</span> ${txt}\n`
					let scroll = chatMessages.scrollTop+chatMessages.offsetHeight+10>=chatMessages.scrollHeight

					if (localStorage.name && txt.includes("@" + localStorage.name.replace(/\W+/g,'').toLowerCase())) {
						newMessage.style.backgroundColor = "rgba(255, 255, 0, 0.5)"
						if (currentChannel == messageChannel) audios.closePalette.run()
					}
					messageChannel = messageChannel || 'en'
					cMessages[messageChannel].push(newMessage.outerHTML)
					if(cMessages[messageChannel].length > 100)cMessages[messageChannel].unshift()
					if (currentChannel == messageChannel) {
						chatMessages.insertAdjacentElement("beforeEnd", newMessage)
					}

					if(chatMessages.children.length>100){
						chatMessages.children[0].remove()
					}
					scroll && chatMessages.scrollTo(0,999999999)
				}
			}
			ws.onclose = (e) => {
				if(CD != Infinity)return location.reload(true)
				//Something went wrong...
				CD = 1e100
				console.error(e)
				if(e.code == 1006 && !sessionStorage.err)sessionStorage.err='1',location.reload(true)
				else loadingScreen.children[0].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAddJREFUeF7tnFEOgyAUBOGQegQP5RG8pA0fNIRohUxTQ53+tbKmTPftEzGN0zTt4cGvbdvQ7KMABYgcpAMRvhAEKEBIAMp1oAAhASjXgQKEBKBcBwoQEoByHShASADKdaAAIQEov92B9AvA+WP5PM/oHPh+oADhHWkBCtASJgTMQEIvhCBAAUICUK4DBQgJQLkOFCAkAOU6UICQAJTrQAFCAlA+vAPXdUUIlmVBegEKUAeiErKE4TPGAhQge0qf7onoQB2oA0kXvH1f2BK2hC1hSxgQcC3sWti1MCigEOzCsAsj+l8QD5+BX2CATjEcwBjje8L7voez9+lYeqXjeVzL+F6aQwLMcEpAeeJHwGqAR/qsewTAPMnSUaXj0vErB56N/3uAZ0779HnprtpptWP/HmBLBpYlW5f5kb4e3wNxuAzsmdwvxg4DsMV5dTbWzaIlO8v8bPkBhgLY0k3rLCwhHGXhYzLw7Hruqvv2AOx1XxqvA6sL7ZayLccMBfAq41oyL7vsaoXSCnIYgK0T+vU4AULiAnw6QOoAyA/Lb98XFiC8Iy1AAd67sa4DdaAOJK3YLkzopU0v+jfI9AlVM9AMNANJFVvChJ4ZCOkJUICcADyDGQgBvgBxwKKvpzakwAAAAABJRU5ErkJggg"
			}
			
  
let palette2 = {
    '109, 0, 26': 0,
    '190, 0, 57': 1,
    '255, 69, 0': 2,
    '255, 168, 0': 3,
    '255, 214, 53': 4,
    '255, 248, 184': 5,
    '0, 163, 104': 6,
    '0, 204, 120': 7,
    '126, 237, 86': 8,
    '0, 117, 111': 9,
    '0, 158, 170': 10,
    '0, 204, 192': 11,
    '36, 80, 164': 12,
    '54, 144, 234': 13,
    '81, 233, 244': 14,
    '73, 58, 193': 15,
    '106, 92, 255': 16,
    '148, 179, 255': 17,
    '129, 30, 159': 18,
    '180, 74, 192': 19,
    '228, 171, 255': 20,
    '222, 16, 127': 21,
    '255, 56, 129': 22,
    '255, 153, 170': 23,
    '109, 72, 47': 24,
    '156, 105, 38': 25,
    '255, 180, 112': 26,
    '0, 0, 0': 27,
    '81, 82, 82': 28,
    '137, 141, 144': 29,
    '212, 215, 217': 30,
    '255, 255, 255': 31,
};

let formatedtime = '';
let days = 0, hours = 0, minutes = 0, seconds = 0;

checkTime = function() {
    seconds+=10;
    if (seconds % 60 === 0) {
        if (minutes === 0) {
            minutes = seconds / 60;
            seconds = 0;
        } else {
            minutes = minutes + seconds / 60;
            seconds = 0;
        }
    }

    if (minutes % 60 === 0) {
        if (hours === 0) {
            hours = minutes / 60;
            minutes = 0;
        } else {
            hours = hours + minutes / 60;
            minutes = 0;
        }
    }

    if (hours % 24 === 0) {
        if (days === 0) {
            days = hours / 24;
            hours = 0;
        } else {
            days = days + hours / 24;
            hours = 0;
        }
    }
}

getTime = function() {
    days = 0;
    hours = 0;
    minutes = 0;
    seconds = 0;

    for (let i = 0; i < pixelStack.length; i++) checkTime();

    if (days > 0) formatedtime = `${days}d, ${hours}h, ${minutes}m and ${seconds}s remaining.`
    else if (hours > 0) formatedtime = `${hours}h, ${minutes}m and ${seconds}s remaining.`
    else if (minutes > 0) formatedtime = `${minutes}m and ${seconds}s remaining.`
    else if (seconds > 0) formatedtime = `${seconds}s remaining.`
    else if (seconds === 0) formatedtime = `Finished.`
}

let input = document.getElementById("fileToLoad")
    input.addEventListener("input", function() {
      if (!input.files || !input.files[0]) return;

      let reader = new FileReader();
      reader.addEventListener("load", function () {
        let image = new Image();
        image.src = reader.result;

        image.addEventListener("load", function () {
        var div = document.createElement("canvas")

        div.id = "canvasImg"
        div.style = "position: absolute; z-index: -24;"
        div.width = image.width;
        div.height = image.height;

        wi = image.width;
        he = image.height;
        document.body.appendChild(div)

        ctxx = document.getElementById("canvasImg").getContext("2d")

        ctxx.drawImage(image, 0, 0);
        });
      });
      reader.readAsDataURL(input.files[0]);
    });

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function format(n) {
    return n.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
}

async function paint(xx, yy, cc) {
    try {
    let a = new DataView(new Uint8Array(6).buffer)
    a.setUint8(0, 4)
    a.setUint32(1, xx + yy * 2000)
    a.setUint8(5, cc)
    await ws.send(a)
    console.log('Bot painted at %s,%s, C: %s', xx, yy, cc)
    let title = 'bot | x: '+xx+', y: '+yy+' c:'+cc

    setTimeout(() => { document.title = title+' | 5s'},0)
    setTimeout(() => { document.title = title+' | 4s'},1000)
    setTimeout(() => { document.title = title+' | 3s'},2000)
    setTimeout(() => { document.title = title+' | 2s'},3000)
    setTimeout(() => { document.title = title+' | 1s'},4000)
    setTimeout(() => { document.title = title+' | 0s'},5000)
    } catch (e) {};
}

async function pastee() {
    let cnv = document.getElementById("canvasImg")
    for (let y = 0; y < cnv.height; y++) {
        if (!started) break;
        for (let x = 0; x < cnv.width; x++) {
            if (!started) break;

            let clr = ctxx.getImageData(x, y, 1, 1).data;
            let clr2 = ctx.getImageData(x + Number(xx.value), y + Number(yy.value), 1, 1).data;
            let c = palette2[`${clr[0]}, ${clr[1]}, ${clr[2]}`];

            if (clr[0] == clr2[0] & clr[1] == clr2[1] && clr[2] == clr2[2] || clr[3] != 255 || c == null) continue;

            paint(x + Number(xx.value), y + Number(yy.value), c);
            await sleep(5000)
        }
    }
}

start.onclick = async function() {
    if (started == false) {
        pixelStack = [];
        start.textContent = "Stop"
        started = true;
        pastee();
    } else {
        start.textContent = "Start"
        started = false;
        document.title = "place"
    }
}
