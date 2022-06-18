var animationFrameId = [];
var stopAnimation = false;

function startScroll() {
  var pos = document.body.scrollHeight;
  var time = window.scrollY * 5;
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
      startScroll()
    }
    else {
      stopScroll()
    }
  }
})
