let isDebugMode = false;

let doDebugModeToggle = () => {
    isDebugMode = !isDebugMode;

    console.log("isDebugMode : " + isDebugMode);
}

let isElementPartiallyInViewport = (el) => {
    if (typeof jQuery !== 'undefined' && el instanceof jQuery)
        el = el[0];

    let rect = el.getBoundingClientRect();
    let windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    let windowWidth = (window.innerWidth || document.documentElement.clientWidth);
    let vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    let horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    return (vertInView && horInView);
}

let scrollFunction = () => {
    let $topBtn = $("#id_backtoTopBtn");

    if (isElementPartiallyInViewport($("#id_shortlistedBoard"))) {
        $topBtn.hide();
    } else {
        $topBtn.show();
    }
}

let backtoTopFn = () => {
    let scrollTopVal = $(".nfOptionsDiv").offset().top;
    $("html, body").stop().animate({ scrollTop: scrollTopVal }, "slow");
}

let doRegisterEvents = () => {
    $("body").off("click", ".goToLinkContainer button, .goToLinkContainer span").on({
        "click": function () {
            let qParamVal = $(this).parent().attr("qParam");
            if (qParamVal)
                window.location.hash = qParamVal;
            else
                history.replaceState(null, null, ' ');

            setTimeout(() => {
                $("main").load("/recruitmentTool/view/rtShortlist.html");
            }, 300);
        }
    }, ".goToLinkContainer button, .goToLinkContainer span");
}

let setSessionData = (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
}

let getSessionData = (key) => {
    let data = JSON.parse(localStorage.getItem(key));
    if (data)
        return data;
}

let clearSessionData  = (key) => {
    localStorage.removeItem(key);
}

let getTranslateXY = (element) => {
    const style = window.getComputedStyle(element)
    const matrix = new DOMMatrixReadOnly(style.transform)
    return {
        translateX: matrix.m41,
        translateY: matrix.m42
    }
}

$(() => {
    doRegisterEvents();
    if (window.location.hash.indexOf("debugMode=1") > -1) {
        doDebugModeToggle();
    }
    window.onscroll = function () { scrollFunction() };
});

(function ($) {
    $.fn.extend({
        cssColorAsHex: function (colorProp) {
            var hexDigits = '0123456789abcdef';

            function hex(x) {
                return isNaN(x) ? '00' : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
            }

            // Convert RGB color to Hex format
            function rgb2hex(rgb) {
                var rgbRegex = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                return '#' + hex(rgbRegex[1]) + hex(rgbRegex[2]) + hex(rgbRegex[3]);
            }

            return rgb2hex(this.css(colorProp));
        }
    });    
}(jQuery));