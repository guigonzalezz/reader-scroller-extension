var animationFrameId = [];
var stopAnimation = false;

function startScroll(defaultSpeed = 30) {
  var pos = document.body.scrollHeight;
  var time = window.scrollY * defaultSpeed;
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
  if(speed == 1) {
    return 30;//More Slower
  } else if(speed == 2) {
    return 20;//Slower
  } else if(speed == 3) {
    return 10;//Slow
  } else if(speed == 4) {
    return 5;//Normal
  } else if(speed == 5) {
    return 2;//Fast
  } else {
    return 30;
  }
}


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


document.getElementById("startButton").addEventListener("click", async function () {
  let speed = document.getElementById("rangeInput").value;
  speed = choosedSpeed(speed);
  await chrome.tabs.query({active: true, currentWindow: true}).then(async ([tab]) => {
    await chrome.scripting.executeScript(
      { 
        target: {tabId: tab.id},
        files: ["scroller.js"]
      }
    );
    await chrome.scripting.executeScript(
      { 
        target: {tabId: tab.id},
        func: startScroll,
        args: [speed]
      }
    );
  })
});

document.getElementById("stopButton").addEventListener("click", async function () {
  await chrome.tabs.query({active: true, currentWindow: true}).then(async([tab]) => {
    await chrome.scripting.executeScript(
      { 
        target: {tabId: tab.id},
        func: stopScroll,
        args: []
      }
    );
  })
});


document.getElementById("donateLink").addEventListener("click", function() {
  window.open(document.getElementById("donateLink").getAttribute("href"), '_blank').focus();
})


document.getElementById("rangeInput").oninput = function() {
  var value = (this.value-this.min)/(this.max-this.min)*100
  this.style.background = 'linear-gradient(to right, #ff9f1c 0%, #ff9f1c ' + value + '%, #1a181b ' + value + '%, #1a181b 100%)'
};