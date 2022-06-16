// let defaultPos = document.body.scrollHeight;
// let defaultTime = 1000000;
// defaultTime = window.scrollY * 30;

//1 Faster
//2.5 Fast
//5 Normal
//10 Slow
//20 Slower
//30 More Slower


let animationFrameId = [];
let stopAnimation = false;

function startScroll() {
  var pos = document.body.scrollHeight;
  var time = window.scrollY * 30;
  console.log("startScroll ===============?>")
  stopAnimation = false;
  var currentPos = window.pageYOffset;
  var start = null;
  if(time == null) time = 500;
  pos = +pos, time = +time;
  animationFrameId.push(window.requestAnimationFrame(function step(currentTime) {
    start = !start ? currentTime : start;
    var progress = currentTime - start;
    if (currentPos < pos) {
        window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos);
    } else {
        window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time));
    }
    if (progress < time && !stopAnimation) {
      animationFrameId.push(window.requestAnimationFrame(step));
    } else {
        window.scrollTo(0, pos);
    }
  }));
}

function stopScroll() {
  console.log("stopScroll ===============?>")
  stopAnimation = true;
  animationFrameId.map(value => window.cancelAnimationFrame(value));
  animationFrameId = [];
}

document.addEventListener('keyup', e => {
  if (e.key == " " || e.code == "Space") {
    if(animationFrameId.length == 0) {
      startScroll()
    }
    else {
      stopScroll()
    }
  }
})

// EXECUTION VIA POPUP EXTESION
document.getElementById("myButton").addEventListener("click", myFunction);
function myFunction(){
  if(animationFrameId.length == 0) {
    chrome.tabs.executeScript({ code: `(${ startScroll })()` });
  }
  else {
    chrome.tabs.executeScript({ code: `(${ stopScroll })()` });
  }
  
}


//Exemplo com retorno do executeScript
// function inContent2(params) {
//   const el = document.createElement('div');
//   el.style.cssText = 'position:fixed; top:0; left:0; right:0; background:red';
//   el.textContent = params.foo;
//   document.body.appendChild(el);
//   return {
//     success: true,
//     html: document.body.innerHTML,
//   };
// }