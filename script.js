let defaultPos = document.body.scrollHeight;
let defaultTime = 1000000;
defaultTime = window.scrollY * 30;

//1 Faster
//2.5 Fast
//5 Normal
//10 Slow
//20 Slower
//30 More Slower


let animationFrameId = [];
let stopAnimation = false;

function startScroll(pos, time) {
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
  stopAnimation = true;
  animationFrameId.map(value => window.cancelAnimationFrame(value));
  animationFrameId = [];
}

document.addEventListener('keyup', e => {
  if (e.key == " " || e.code == "Space") {
    if(animationFrameId.length == 0) {
      startScroll(defaultPos, defaultTime)
    }
    else {
      stopScroll()
    }
  }
})


document.getElementById("myButton").addEventListener("click", startScroll(defaultPos, defaultTime));
function myFunction(){
  console.log("CLIQUEI ====================")
}