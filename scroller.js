// let defaultPos = document.body.scrollHeight;
// let defaultTime = 1000000;
// defaultTime = window.scrollY * 30;



var animationFrameId = [];
var stopAnimation = false;
var lastSpeedSelected = null

function startScroll(defaultSpeed = 1) {
  lastSpeedSelected = choosedSpeed(defaultSpeed)
  var pos = document.body.scrollHeight;
  var time = window.scrollY * lastSpeedSelected;
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

function choosedSpeed(speed) {
  var returnedSpeed = 30;
  switch(speed) {
    case 1:
      returnedSpeed = 30//More Slower
      break;
    case 2:
      returnedSpeed = 20;//Slower
      break;
    case 3:
      returnedSpeed = 10;//Slow
      break;
    case 4:
      returnedSpeed = 5;//Normal
      break;
    case 5:
      returnedSpeed = 2.5;//Fast
      break;
  }
  return returnedSpeed;
}

function updateSpeed(speed) {
  lastSpeedSelected = choosedSpeed(speed);
}

// Start and Stop clicking on space bar
// Add this on future versions
document.addEventListener('keyup', e => {
  if (e.key == " " || e.code == "Space") {
    if(animationFrameId.length == 0) {
      startScroll(!lastSpeedSelected ? 1 : lastSpeedSelected)
    }
    else {
      stopScroll()
    }
  }
})