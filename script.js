document.getElementById("startButton").addEventListener("click", function () {
  let speed = document.getElementById("rangeInput").value;
  chrome.tabs.executeScript({ file: 'scroller.js' }, function () {
    chrome.tabs.executeScript({ code: `(startScroll)(${speed})` });
  });
});

document.getElementById("stopButton").addEventListener("click", function () {
  chrome.tabs.executeScript({ code: `(stopScroll)()` });
});

document.getElementById("rangeInput").addEventListener("change", function(e) {
  let speed = document.getElementById("rangeInput").value;
  chrome.tabs.executeScript({ code: `(updateSpeed)(${speed})` });
})


document.getElementById("donateLink").addEventListener("click", function() {
  window.open(document.getElementById("donateLink").getAttribute("href"), '_blank').focus();
})

