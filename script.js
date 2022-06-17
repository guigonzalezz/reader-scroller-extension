document.getElementById("startButton").addEventListener("click", function () {
  chrome.tabs.executeScript({ file: 'scroller.js' }, function () {
    chrome.tabs.executeScript({ code: `(startScroll)()` });
  });
});

document.getElementById("stopButton").addEventListener("click", function () {
  chrome.tabs.executeScript({ code: `(stopScroll)()` });
});


