const otpForm = $('#otp-form');
const otpSubmit = $('#otp-submit');
const username = $("#username");
const birthDate = $("#birthDate");
const nationalId = $("#nationalId");

/*####################################################################################################
#                                         Utils                                                 #
####################################################################################################*/

function gregorian_to_jalali(gy, gm, gd) {
    var g_d_m, jy, jm, jd, gy2, days;
    g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    gy2 = (gm > 2) ? (gy + 1) : gy;
    days = 355666 + (365 * gy) + ~~((gy2 + 3) / 4) - ~~((gy2 + 99) / 100) + ~~((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
    jy = -1595 + (33 * ~~(days / 12053));
    days %= 12053;
    jy += 4 * ~~(days / 1461);
    days %= 1461;
    if (days > 365) {
        jy += ~~((days - 1) / 365);
        days = (days - 1) % 365;
    }
    if (days < 186) {
        jm = 1 + ~~(days / 31);
        jd = 1 + (days % 31);
    } else {
        jm = 7 + ~~((days - 186) / 30);
        jd = 1 + ((days - 186) % 30);
    }
    return [jy, jm, jd];
}

function convertNumToEn(str, convert = false) {
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];

    if (typeof str === 'string') {
        for (let i = 0; i < 10; i++) {
            // @ts-ignore
            str = str.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);
        }
    }

    return convert ? Number(str) : str;
}


function clearTimer(name) {
    if (window?.[name]) {
        clearInterval(window[name])
    }
}

function appendHtml(el, str) {
    const div = document.createElement('div');
    div.innerHTML = str;
    while (div.children.length > 0) {
        el.appendChild(div.children[0]);
    }
}

function each(selector, callback) {
    const items = document.querySelectorAll(selector);
    for (let i = 0; i < items.length; i++) {
        callback(items.item(i), i);
    }
}

function fadeOut(element, ms = 300) {
    return new Promise((resolve, reject) => {
        try {
            let opacity = 1;
            const id = setInterval(function () {
                opacity = opacity - 0.1;
                element.style.opacity = opacity < 1 ? 0 : opacity;
                if (opacity <= 0) {
                    element.style.display = "none";
                    element.style.opacity = 0;
                    clearInterval(id);
                    resolve(element);
                }
            }, Math.round(ms / 10))
        } catch (e) {
            reject(e);
        }
    })
}


function fadeIn(element, ms = 300) {
    return new Promise((resolve, reject) => {
        try {
            element.style.display = "block";
            element.style.opacity = 0;
            let opacity = 0;
            const id = setInterval(function () {
                opacity = opacity + 0.1;
                element.style.opacity = opacity > 1 ? 1 : opacity;
                if (opacity >= 1) {
                    clearInterval(id);
                    resolve(element);
                }
            }, Math.round(ms / 10))
        } catch (e) {
            reject(e);
        }
    })
}


function $(selector) {
    if (selector.startsWith("#") && !selector.includes(".")) {
        return document.querySelector(selector);
    }
    return document.querySelectorAll(selector);
}

function toEnglishDigits(str) {
    // convert persian digits [۰۱۲۳۴۵۶۷۸۹]
    var e = "۰".charCodeAt(0);
    str = str.replace(/[۰-۹]/g, function (t) {
        return t.charCodeAt(0) - e;
    });

    // convert arabic indic digits [٠١٢٣٤٥٦٧٨٩]
    e = "٠".charCodeAt(0);
    str = str.replace(/[٠-٩]/g, function (t) {
        return t.charCodeAt(0) - e;
    });
    return str;
}

function isValidKharejiNationalCode(input) {
    if (!/^\d{10,15}$/.test(input)) return false;
    return true;
}

function isValidIranianNationalCode(input) {
    if (!/^\d{10}$/.test(input)) return false;
    const check = +input[9];
    const sum =
        input
            .split("")
            .slice(0, 9)
            .reduce((acc, x, i) => acc + +x * (10 - i), 0) % 11;
    return sum < 2 ? check === sum : check + sum === 11;
}

const jalaliMonths = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
];


const gergorianMonths = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];


const months = lang === "en" ? gergorianMonths : jalaliMonths;

function addZero(number, length) {
    let num = "" + number;
    while (num.length < length) {
        num = "0" + num;
    }
    return num;
}

function isLeapYearJalali(year) {
    const matches = [1, 5, 9, 13, 17, 22, 26, 30];
    const modulus = year - Math.floor(year / 33) * 33;
    let isLeapYear = false;

    for (let i = 0; i != 8; i++) {
        if (matches[i] == modulus) {
            isLeapYear = true;
        }
    }

    return isLeapYear;
}

function errorMessageHandler(error) {
    if (error?.response?.data?.gateWayMessage) {
        return error?.response?.data?.gateWayMessage;
    }

    if (error?.response?.data?.msg) {
        return error?.response?.data?.msg;
    }

    if (error?.responseJSON?.msg) {
        return error?.responseJSON?.msg;
    }

    if (
        error?.response?.data?.code &&
        error?.response?.data?.enErrorMessage &&
        error?.response?.data?.enErrorMessage?.length > 0 &&
        // error?.response?.data?.enErrorMessage?.includes &&
        checkForPersianLetters(error?.response?.data?.enErrorMessage)
    ) {
        if (isValidJson(error?.response?.data?.enErrorMessage)) {
            return (
                JSON.parse(error?.response?.data?.enErrorMessage)?.data?.ResMsg ||
                languageProperties["messages.internalerrors"]
            );
        }
        return error?.response?.data?.enErrorMessage;
    }
    if (
        error &&
        error?.message &&
        error?.message?.includes &&
        error?.message?.includes("Network Error")
    ) {
        return languageProperties["messages.tryagain"];
    }
    return languageProperties["messages.internalerrors"];
}

function formatParams(params) {


    // console.log("params1",params);
    // console.log("params2", Object.keys(params)
    //     .map(function (key) {
    //         return key + "=" + encodeURIComponent(params[key]);
    //     })
    //     .join("&"));

    return (
        // "?" +
        Object.keys(params)
            .map(function (key) {
                return key + "=" + encodeURIComponent(params[key]);
            })
            .join("&")
    );
}

function setLoading(btn, status) {
    if (status) {
        btn.setAttribute("disabled", true);
    } else {
        btn.removeAttribute("disabled");
    }
    btn.innerText = (!status ? btn.getAttribute("data-init-text") : languageProperties["loading"]);
}

function toast(msg, type = "error") {
    // Get the SIMPLE-TOAST DIV
    const toastContainer = document.getElementById("toast");
    // Add the "show" class to DIV
    document.querySelectorAll(".toast-description h3").item(0).innerText = type === "error" ? languageProperties["messages.error"] : languageProperties["messages.success"];
    document.querySelectorAll(".toast-description p").item(0).innerText = msg;
    document.querySelectorAll(".toast-icon img").item(0).setAttribute("src", type === "error" ? "../static/web/assets/images/Checked-box.png" : "../static/web/assets/images/SuccessCheckbox.png");
    document.querySelectorAll(".toast-icon").item(0).className = type !== "error" ? "toast-icon success" : "toast-icon";
    toastContainer.className = "show";
    // After 3 seconds, remove the show class from DIV
    setTimeout(function () {
        toastContainer.className = toastContainer.className.replace("show", "");
    }, 3000);
}


/*####################################################################################################
#                                         Carousel                                                  #
####################################################################################################*/

const carousel = $(".carousel").item(0);
let activeIndex = 0;

const indicators = $(".indicators").item(0).getElementsByTagName("li");

for (let index = 0; index < indicators.length; index++) {
    indicators.item(index).addEventListener("click", function () {
        activeIndex = index;
        for (let indicatorsIndex = 0; indicatorsIndex < indicators.length; indicatorsIndex++) {
            indicators.item(indicatorsIndex).className = "";
            carousel.getElementsByClassName("item").item(indicatorsIndex).style.opacity = 0;
            carousel.getElementsByClassName("item").item(indicatorsIndex).style.zIndex = -1;
        }
        indicators.item(activeIndex).className = "active";
        carousel.getElementsByClassName("item").item(activeIndex).style.opacity = 1;
        carousel.getElementsByClassName("item").item(activeIndex).style.zIndex = 1;
    });
}

function sliderSwipeHandler(){
    if (activeIndex > carousel.getElementsByClassName("item").length - 1) {
        activeIndex = 0;
    }

    for (let index = 0; index < indicators.length; index++) {
        indicators.item(index).className = "";
        carousel.getElementsByClassName("item").item(index).style.opacity = 0;
        carousel.getElementsByClassName("item").item(index).style.zIndex = -1;
    }

    indicators.item(activeIndex).className = "active";
    carousel.getElementsByClassName("item").item(activeIndex).style.opacity = 1;
    carousel.getElementsByClassName("item").item(activeIndex).style.zIndex = 1;
    activeIndex = activeIndex + 1;
}

sliderSwipeHandler()

setInterval(sliderSwipeHandler, 9000);


/*####################################################################################################
#                                         OTP Services                                                  #
####################################################################################################*/

function validateMobile(mobile) {
    const regex = new RegExp("^(09)\\d{9}$");
    return regex.test(mobile);
}

if (username) {

    const formButton = document.getElementById("form").getElementsByTagName("button").item(0);

    if (formButton) {
        setInterval(function () {
            if (username?.value && username.value.length === 11) {
                const validationStatus = validateMobile(username.value);
                if (validationStatus) {
                    if ($(".captcha_value").length >= 0){
                        if ($(".captcha_value")[0].value.length>=5){
                            formButton.removeAttribute("disabled")
                        }else {
                            formButton.setAttribute("disabled", true);
                        }
                    }
                } else {
                    formButton.setAttribute("disabled", true);
                }
                $(".username-error").innerText = (validationStatus ? "" : languageProperties["messages.mobileIsInvalid"]);
            }
        }, 500)


        username.addEventListener("keyup", function (event) {
            if (event.target.value.length >= 11 && event.which !== 8) {
                event.preventDefault();
            }
            const validationStatus = validateMobile(event.target.value);
            // console.log("event.target.value",validationStatus,event.target.value);
            if (validationStatus) {
                // formButton.removeAttribute("disabled");
            } else {
                formButton.setAttribute("disabled", true);
            }
            $(".username-error").item(0).innerText = (validationStatus ? "" : languageProperties["messages.mobileIsInvalid"]);
        });

        if ($(".captcha_value")?.length > 0) {
            $(".captcha_value").item(0).addEventListener("keyup", function (event) {
                if (event.target.value.length >= 5 && event.which !== 8) {
                    event.preventDefault();
                    formButton.focus();
                }
                if (event.target.value.length === 5 && event.which !== 8) {
                    if (username?.value && username.value.length === 11) {
                        const validationStatus = validateMobile(username.value);
                        if (validationStatus) {
                             formButton.removeAttribute("disabled");}
                    }
                    formButton.focus();
                }
            })
        }
    } else {
        console.error("formButton Not Detected !");
    }

}

function extractCsrfToken() {
    let csrfs = document.getElementsByName('_csrf');
    let csrfToken = "";
    let csrfHeader = "X-CSRF-TOKEN";
    if (csrfs.length === 1) {
        csrfToken = csrfs[0].value;
        csrfHeader = csrfs[0].getAttribute("header");
    }
    return csrfToken;
}

function sendOtpService() {
    console.log("sendOtp Service Calls");
    let csrfToken = extractCsrfToken();
    if (localStorage.getItem('st')){
        localStorage.removeItem("st");
    }
    let sendBtn = $("#otp-form button");
    let mobile = username.value;

    sessionStorage.setItem("mobile", mobile);
let otpHolder = document.querySelector("#otp-mobile-holder")
    if (otpHolder){
        console.log({otpHolder})
        otpHolder.innerText = (mobile);
    }
    $(".errors-holder p").item(0).innerText = ("");
    let captcha_key = $(".captcha_key").item(0).value;
    let captcha_value = $(".captcha_value").item(0).value;

    if (captcha_value?.length) {

        setLoading(sendBtn, true);
        each(".username_final", function (item) {
            item.value = mobile
        });

        httpService(
            "/sendOtp",
            {
                mobile: mobile,
                captcha_key: captcha_key,
                captcha_value: captcha_value
            },
            {
                "Content-type": "application/x-www-form-urlencoded",
                // "Accept-Language": lang
                "X-CSRF-TOKEN": csrfToken
            },
            function (xhttp) {
                setLoading($("#otp-form button"), false);
                if (xhttp.status === 200) {

                    sendBtn.setAttribute("disabled", true);
                    getCaptchaService();

                    // otpForm.style.display = "none";
                    // otpSubmit.style.display = "block";

                    fadeOut(otpForm).then(function () {
                        fadeIn(otpSubmit).then(function () {
                            startTimer();

                            each(".first", function (item) {
                                item.focus();
                            });

                            if ($(".errors-holder")?.length) {
                                each(".errors-holder", function (item) {
                                    if (item && item.querySelector("p")) {
                                        item.querySelector("p").innerText = "";
                                    }
                                });
                            }
                        });
                    })

                } else if (xhttp.status === 403) {
                    location.reload();
                } else {
                    getCaptchaService();
                    $(".captcha_value").item(0).value = "";
                    const json = JSON.parse(xhttp?.response);
                    if (xhttp.status === 400 || json.code === 400) {
                        if (json.msg)
                            toast(json.msg)
                        else
                            toast(languageProperties["messages.checkinput"])
                    } else {
                        toast(json?.enErrorMessage || languageProperties["messages.tryagain"])
                    }
                }
            },
            "POST",
            true,
            false
        )

    } else {
        toast(languageProperties["resetUserMultiFactorAuth.lables.captcha"]);
    }

}

function sendSubstituteOtpService() {
    console.log("sendSubstituteOtpService Service Calls");
    let csrfToken = extractCsrfToken();
    if (localStorage.getItem('st')){
        localStorage.removeItem("st");
    }
    // let sendBtn = $("#otp-form button");
    // let mobile = username.value;

    let sendBtn = $("#otp-form button");
    let subcode = $("#subcode").value;
    let mobile = $("#mobile").value;

    sessionStorage.setItem("mobile", mobile);
    let otpHolder = document.querySelector("#otp-mobile-holder")
    if (otpHolder){
        console.log({otpHolder})
        otpHolder.innerText = (mobile);
    }
    $(".errors-holder p").item(0).innerText = ("");
    let captcha_key = $(".captcha_key").item(0).value;
    let captcha_value = $(".captcha_value").item(0).value;

    if (captcha_value?.length) {

        setLoading(sendBtn, true);
        each(".username_final", function (item) {
            item.value = mobile
        });

        httpService(
            "/sub/sendOtp",
            {
                subcode: subcode,
                mobile: mobile,
                captcha_key: captcha_key,
                captcha_value: captcha_value
            },
            {
                "Content-type": "application/x-www-form-urlencoded",
                // "Accept-Language": lang
                "X-CSRF-TOKEN": csrfToken
            },
            function (xhttp) {
                setLoading($("#otp-form button"), false);
                if (xhttp.status === 200) {

                    $(".subcode_final").item(0).value  = toEnglishDigits(subcode);
                    sendBtn.setAttribute("disabled", true);
                    getCaptchaService();

                    // otpForm.style.display = "none";
                    // otpSubmit.style.display = "block";

                    fadeOut(otpForm).then(function () {
                        fadeIn(otpSubmit).then(function () {
                            startTimer();

                            each(".first", function (item) {
                                item.focus();
                            });

                            if ($(".errors-holder")?.length) {
                                each(".errors-holder", function (item) {
                                    if (item && item.querySelector("p")) {
                                        item.querySelector("p").innerText = "";
                                    }
                                });
                            }
                        });
                    })

                } else if (xhttp.status === 403) {
                    location.reload();
                } else {
                    getCaptchaService();
                    $(".captcha_value").item(0).value = "";
                    const json = JSON.parse(xhttp?.response);
                    if (xhttp.status === 400 || json.code === 400) {
                        if (json.msg)
                            toast(json.msg)
                        else
                            toast(languageProperties["messages.checkinput"])
                    } else {
                        toast(json?.enErrorMessage || languageProperties["messages.tryagain"])
                    }
                }
            },
            "POST",
            true,
            false
        )

    } else {
        toast(languageProperties["resetUserMultiFactorAuth.lables.captcha"]);
    }

}
// form-otp-submit-qr
function submitEvent(event, parentSelector) {
    event && event.preventDefault();
    const password = $(parentSelector + ' .first').item(0).value +
        $(parentSelector + ' .second').item(0).value +
        $(parentSelector + ' .third').item(0).value +
        $(parentSelector + ' .fourth').item(0).value +
        $(parentSelector + ' .fifth').item(0).value;

    $(parentSelector + ' .password_final').item(0).value = toEnglishDigits(password);

    // console.log("password",password,"   ",password?.length,"  ",password?.length === 5);

    if (password?.length === 5) {
        $("#submitLogin").setAttribute("disabled", true);
        $(parentSelector).submit();
    } else {
        toast(languageProperties["messages.captchaRequired"]);
    }

}


function httpService(url, params, headers, callback, method = "GET", isAsync = true, isJson = true, isBlob = false) {
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, isAsync);

    if (isBlob) {
        xhttp.responseType = 'blob';
    }

    Object.keys(headers).forEach(function (key) {
        xhttp.setRequestHeader(key, headers[key]);
    });

    xhttp.onload = function () {
        callback(xhttp);
    };

    xhttp.send(isJson ? JSON.stringify(params) : formatParams(params));
}

/*####################################################################################################
#                                         Captcha Services                                                  #
####################################################################################################*/

function getCaptchaService() {
    let csrfToken = extractCsrfToken();

    if (csrfToken)
        headers['X-CSRF-TOKEN'] = csrfToken;
    if ($(".captcha")?.length) {
        httpService("/client/v1/captcha", {}, headers, function (xhttp) {
            if (xhttp.status === 200) {
                const response = JSON.parse(xhttp?.response);
                $(".captcha").item(0).setAttribute(
                    "src",
                    !response.value.includes("data:")
                        ? "data:image/png;base64, " + response.value
                        : response.value
                );
                $(".captcha_key").item(0).value = (response.key);
                $(".captcha_value").item(0).value = ("");
            } else if (xhttp.status === 403) {
                location.reload();
            } else {
                toast(languageProperties["messages.captchaFetchError"]);
            }
        });
    }
}


getCaptchaService();

let getCaptchaVoiceServiceUrl;
let audio = new Audio();

function getCaptchaVoiceService() {
    if ($(".captcha")?.length && $(".captcha_key")?.item(0)?.value) {
        httpService("/client/v1/captcha/audio/" + $(".captcha_key")?.item(0)?.value, {}, headers, function (xhttp) {

            if (getCaptchaVoiceServiceUrl) {
                URL.revokeObjectURL(getCaptchaVoiceServiceUrl);
                audio.pause();
            }

            console.log("getCaptchaVoiceService", xhttp.status, xhttp.response);

            if (xhttp.status === 200) {
                // xhttp?.response
                let blob = new Blob([xhttp.response], {type: 'audio/wav'});
                getCaptchaVoiceServiceUrl = URL.createObjectURL(blob)

                console.log("url", url);

                // audio.addEventListener('ended', cleanup);

                audio.src = getCaptchaVoiceServiceUrl;

                audio.load();

                audio.play().then(() => {
                    console.log("playing ...");
                }).catch((error) => console.error("Player Failed : ", error));
            } else {
                toast(languageProperties["messages.voiceCaptchaFetchError"]);
            }
        }, "GET", true, true, true);
    }
}

/*####################################################################################################
#                                         Timer                                                  #
####################################################################################################*/

const startTimer = () => {
    let startTime = localStorage.getItem("st");
    const now = Math.round(new Date().getTime() / 1000);

    $("#qr-image").className = "";

    if (startTime) {
        if (now - startTime > 120) {
            window.seconds = 120;
            localStorage.setItem("st", now.toString());
        }
    } else {
        window.seconds = 120;
        localStorage.setItem("st", now.toString());
    }

    clearTimer("timerId");
    clearTimer("getOtpIntervalQr");

    window.timerId = setInterval(() => {
        let startTime = localStorage.getItem("st");
        const now = Math.round(new Date().getTime() / 1000);

        window.seconds = 120 - (now - startTime);


        if (window.seconds < 0) {

            clearTimer("timerId");
            clearTimer("getOtpIntervalQr");

            const submitLoginBtn = $("#submitLogin");
            // console.log("submitLoginBtn",submitLoginBtn,submitLoginBtn?.length);
            if (window.seconds <= 0) {

                $("#qr-image").className = "retry";

                if (submitLoginBtn) {
                    submitLoginBtn.removeAttribute("disabled");
                    // submitLoginBtn.innerHTML = `<img src="../static/web/assets/images/SendIcon4.svg" alt="" /> <span>${languageProperties["buttons.resendOtp"]}</span>`;
                    submitLoginBtn.innerHTML = `<span>${languageProperties["buttons.resendOtp"]}</span>`;

                    submitLoginBtn.addEventListener("click", function (event) {
                        event.preventDefault();
                        console.log("resend otp");
                        // otpForm.style.display = "block";
                        // otpSubmit.style.display = "none";

                        fadeOut(otpSubmit).then(function () {
                            fadeIn(otpForm).then(() => {
                            });
                        })

                        $("#submitLogin").innerHTML = `<img src="../static/web/assets/images/SendIcon.svg" alt="" />
                                <div class="timer">
                                    <span class="minutes">00</span> :
                                    <span class="seconds">00</span>
                                </div>`;
                    })
                }
            }
            // if ($("[href='#qr']").hasClass("active")) {
            //   initQrCode();
            // }
            return;
        }
        let minutes = Math.floor(window.seconds / 60);
        let seconds = window.seconds - Math.floor(window.seconds / 60) * 60;
        // console.log("new", $(".timer .minutes").item(0));
        each(".timer .minutes", function (item) {
            item.innerText = minutes < 1 ? 0 : minutes
        });
        each(".timer .seconds", function (item) {
            item.innerText = seconds < 1 ? 0 : seconds;
        });

        window.seconds = window.seconds - 1;

    }, 1000);
};

if (typeof otp !== "undefined" && otp) {
    startTimer();
}
// startTimer();

/*####################################################################################################
#                                         OTP Number Inputs                                                  #
####################################################################################################*/

const numberInputs = $(".userInput .number");

const numberInputsForValidator = $(".inputNumber");

let keyupEvent = function (event) {
    if (this.value.length >= 1) {
        event.preventDefault();
    }

    const last = this?.nextSibling?.nextElementSibling;

    // console.log("numbernumber", `.${this.getAttribute("class").replace(" number","")}`);

    if (this.value.length) {
        if (this.getAttribute("class").includes("fifth")) {
            // console.log("submitEvent trigered",this.closest("form").getAttribute("id"));
            submitEvent(null, "#" + this.closest("form").getAttribute("id"));
        } else {
            each(`.${this.getAttribute("class").replace(" number", "")}`, function (item) {
                item?.nextSibling?.nextElementSibling.focus();
            });
        }
    }
};

let keydownEvent = function (event) {
    // console.log("event.key", event.key);
    if (this.value.length === 1) {
        this.value = "";
        return false;
    }

    if (((!(/^[0-9۱۲۳۴۵۶۷۸۹۰]$/i.test(event.key))) || this.value.length >= 1) && event.which !== 8) {
        event.preventDefault();
        return false;
    }

    this.value = toEnglishDigits(this.value);

    if (
        event.which === 8 &&
        this.value.length === 0 &&
        this?.previousSibling?.previousElementSibling
    ) {
        this.previousSibling.previousElementSibling.focus();
        return false;
    }

};


let pasteEvent = function (event) {
    let text = (event.originalEvent || event).clipboardData.getData('text/plain');

    if (!text || text?.length !== 1) {
        event.preventDefault();

        if (text && text?.length === 5) {
            text = toEnglishDigits(text.toString());
            const numbersArray = text.split("");
            numberInputs.forEach((item, key) => {
                item.value = numbersArray?.[key];
                if (key === numberInputs?.length - 1) {
                    item.focus();
                    submitEvent(null, "#" + event?.target?.closest("form").getAttribute("id"));
                }
            });
        }

        return false;
    }

    if (!(/^[0-9]$/i.test(text.toString()))) {
        event.preventDefault();
        return false;
    }

    event.target.value = text;

    event?.target?.nextSibling?.nextElementSibling?.focus();

}

numberInputs.forEach((item) => {
    item.addEventListener("keyup", keyupEvent);
});

numberInputs.forEach((item) => {
    item.addEventListener("keydown", keydownEvent);
});

numberInputs.forEach((item) => {
    item.addEventListener("onpaste", pasteEvent);
    item.addEventListener("paste", pasteEvent);
});

// function numberInputsValidateEvent(event){
//
//     console.log("event",event.which,event.target.value);
//
//     if (
//         event.which === 8
//     ) {
//         return true;
//     }
//
//     if (!(event.which >= 1776 && event.which <=1785) && !(event.which >= 48 && event.which <=57) && event.which !== 8) {
//         event.preventDefault();
//         return false;
//     }
//
// }

function numberInputsValidateOnPasteEvent(event) {

    let text = (event.originalEvent || event).clipboardData.getData('text/plain');

    text = toEnglishDigits(text.toString());

    if (!(/^[0-9]$/i.test(text.toString()))) {
        event.preventDefault();
        return false;
    }

    event.target.value = text;

}

function numberInputsValidateOnKeyUpEvent(event) {
    event.target.value = toEnglishDigits(event.target.value);
}

numberInputsForValidator.forEach((item) => {
    // item.addEventListener("keydown", numberInputsValidateEvent);
    item.addEventListener("keyup", numberInputsValidateOnKeyUpEvent);
    item.addEventListener("paste", numberInputsValidateOnPasteEvent);
    item.addEventListener("onpaste", numberInputsValidateOnPasteEvent);
});

// const body = $("body");

// body.on("focus", "input[type=number]", function (e) {
//   $(this).on("wheel.disableScroll", function (e) {
//     e.preventDefault();
//   });
// });

// body.on("blur", "input[type=number]", function (e) {
//   $(this).off("wheel.disableScroll");
// });

// numberInputs.click(function () {
//   $(this).val("");
// });
/*####################################################################################################
#                                        Register Service                                           #
####################################################################################################*/

function handleRegisterPostCode(event) {
    event?.preventDefault();
    const postalCode = $("#postalCode").value;

    let errors = 0;
    // const postalCodeRegex = new RegExp(/\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/g);

    // let postalCodeFieldExists = false;
    // if ($('#postalCode').length)
    //     postalCodeFieldExists = true;
    // if (!postalCode || postalCode?.length !== 10 || !/^\d+$/.test(postalCode)) {
    const postalCodeRegex = new RegExp(/^[0-9]{10}$/g);
    if (!postalCode || !postalCodeRegex.test(postalCode)) {
        errors++;
        toast(languageProperties["messages.postalCodeIsInvalid"])
    }

    if (errors === 0) {
        // console.log("postalCode", postalCode);
        // debugger;
        $("#register_post_btn").setAttribute("disabled", "disabled");
        $("#form").submit();
    }
}

function handleRegisteration(event) {
    event.preventDefault();

    localStorage.setItem("userType", "foreigner");

    // const nationalId = $("#nationalId2");
    const birthDate = $("#birthDate2");

    console.log("handleForeignerRegister");

    // let postalCodeFieldExists = false;
    // if ($('#postalCode2'))
    //     postalCodeFieldExists = true;

    let birthDateFieldExists = false;
    if ($('#birthDate2'))
        birthDateFieldExists = true;

    // const postalCode = $("#postalCode2")?.value;

    let errors = 0;

    // if (birthDateFieldExists) {
    //     errors++;
    //     toast(' وارد شده نا متعبر است')
    // }

    // if(postalCodeFieldExists){
    //     const postalCodeRegex = new RegExp(/^[0-9]{10}$/g);
    //     if (postalCodeFieldExists && !postalCodeRegex.test(postalCode)) {
    //         errors++;
    //         toast('کد پستی نا صحیح است')
    //     }
    // }

    // if (!postalCodeFieldExists && $("#description")) {
    //     $("#description").innerText = (`کاربر گرامی جهت احراز هویت تاریخ تولد و کد اتباع خود راوارد نمایید`)
    // }


    // console.log("birthDate",birthDate?.value);

    if (birthDateFieldExists) {
        if (!birthDate?.value || !birthDate.value?.length || birthDate.value.length < 8) {
            errors++;
            toast(languageProperties["messages.birthdateRequired"])
        }
    }
    console.log("handleForeignerRegister | errors" + errors);
    if (errors === 0) {
        if (birthDateFieldExists) {
            birthDate.value = toEnglishDigits(birthDate?.value);
        }
        // console.log("birthDate", birthDate?.value);
        // console.log("nationalId", nationalId?.value);
        console.log("errors", errors);
        debugger;
        $("#register_btn2").setAttribute("disabled", true);
        $("#form2").submit();
    }
}


function handleForeignerRegister(event) {
    event.preventDefault();

    localStorage.setItem("userType", "foreigner");

    // const nationalId = $("#nationalId2");
    const birthDate = $("#birthDate2");

    console.log("handleForeignerRegister");

    let postalCodeFieldExists = false;
    if ($('#postalCode2'))
        postalCodeFieldExists = true;

    let birthDateFieldExists = false;
    if ($('#birthDate2'))
        birthDateFieldExists = true;

    const postalCode = $("#postalCode2")?.value;

    let errors = 0;

    // if (birthDateFieldExists) {
    //     errors++;
    //     toast(' وارد شده نا متعبر است')
    // }

    if (postalCodeFieldExists) {
        const postalCodeRegex = new RegExp(/^[0-9]{10}$/g);
        if (postalCodeFieldExists && !postalCodeRegex.test(postalCode)) {
            errors++;
            toast(languageProperties["messages.postalCodeIsInvalid"])
        }
    }

    if (!postalCodeFieldExists && $("#description")) {
        $("#description").innerText = (languageProperties["messages.foreginerDescription"])
    }


    // console.log("birthDate",birthDate?.value);

    if (birthDateFieldExists) {
        if (!birthDate?.value || !birthDate.value?.length || birthDate.value.length < 8) {
            errors++;
            toast(languageProperties["messages.birthdateRequired"])
        }
    }

    if (errors === 0) {
        if (birthDateFieldExists) {
            birthDate.value = toEnglishDigits(birthDate?.value);
        }
        // console.log("birthDate", birthDate?.value);
        // console.log("nationalId", nationalId?.value);
        console.log("errors", errors);
        debugger;
        $("#register_btn2").setAttribute("disabled", true);
        $("#form2").submit();
    }
}

function handleRegister(event) {
    event.preventDefault();

    localStorage.setItem("userType", "iranian");

    console.log("handleRegister");

    let postalCodeFieldExists = false;
    if ($('#postalCode'))
        postalCodeFieldExists = true;

    let birthDateFieldExists = false;
    if ($('#birthDate'))
        birthDateFieldExists = true;

    const postalCode = $("#postalCode")?.value;

    let errors = 0;

    if (birthDateFieldExists && !isValidIranianNationalCode(nationalId?.value)) {
        errors++;
        toast(' وارد شده نا متعبر است')
    }

    if (postalCodeFieldExists) {
        const postalCodeRegex = new RegExp(/^[0-9]{10}$/g);
        if (postalCodeFieldExists && !postalCodeRegex.test(postalCode)) {
            errors++;
            toast(languageProperties["messages.postalCodeIsInvalid"])
        }
    }

    if (!postalCodeFieldExists && $("#description")) {
        $("#description").innerText = (languageProperties["messages.postalCodeExistDescription"])
    }


    // console.log("birthDate",birthDate?.value);

    if (birthDateFieldExists) {
        if (!birthDate?.value || !birthDate.value?.length || birthDate.value.length < 8) {
            errors++;
            toast(languageProperties["messages.birthdateRequired"])
        }
    }

    if (errors === 0) {
        if (birthDateFieldExists) {
            birthDate.value = toEnglishDigits(birthDate?.value);
        }
        // console.log("birthDate", birthDate?.value);
        // console.log("nationalId", nationalId?.value);
        console.log("errors", errors);
        debugger;
        $("#register_btn").setAttribute("disabled", true);
        $("#form").submit();
    }
}

if ($(".nationalId")) {


    each(".nationalId", function (nationalIdItem, nationalIdIndex) {

        const btn = nationalIdItem.parentNode.parentNode.parentNode.querySelector(".btn");
        const errorHolder = nationalIdItem.parentElement.parentElement.nextElementSibling.querySelector(".nationalId-error")


        setInterval(function () {
            if (nationalIdItem?.value && nationalIdItem.value.length === 10 && isValidIranianNationalCode(nationalIdItem.value)) {
                errorHolder.innerText = ("");

                btn.removeAttribute("disabled");
            } else {

                btn.setAttribute("disabled", true);
                errorHolder.innerText = (languageProperties["messages.nationalCodeValidate"]);
                ;
            }
        }, 500)


        nationalIdItem.addEventListener("keyup", function (event) {
            if (event.target.value.length >= 10 && event.which !== 8) {
                event.preventDefault();
            }
            // const validationStatus = validateMobile(event.target.value);
            // console.log("event.target.value",validationStatus,event.target.value);
            if (nationalIdItem?.value && nationalIdItem.value.length === 10 && isValidIranianNationalCode(nationalIdItem.value)) {
                btn.removeAttribute("disabled");
                errorHolder.innerText = ("");

            } else {
                btn.setAttribute("disabled", true);
                errorHolder.innerText = (languageProperties["messages.nationalCodeValidate"]);
                ;

            }

        });

    });


}

document.querySelector("#passPortCode")?.addEventListener('keyup',(e)=>{
    console.log(e.target.value)
    if (e.target.value.length >=1){
        $('#guide-text').classList.remove('hidden')
    } else {
        $('#guide-text').classList.add('hidden')
    }
})


if ($(".foreignerCode")) {

    each(".foreignerCode", function (nationalIdItem, nationalIdIndex) {

        const btn = nationalIdItem.parentNode.parentNode.parentNode.querySelector(".btn");
        const errorHolder = nationalIdItem.parentElement.parentElement.nextElementSibling.querySelector(".nationalId-error")


        // setInterval(function () {
        //     if (nationalIdItem?.value && nationalIdItem.value.length === 12) {
        //         errorHolder.innerText = ("");
        //
        //         btn.removeAttribute( "disabled");
        //     }else {
        //
        //         btn.setAttribute("disabled", true);
        //         errorHolder.innerText = (nationalIdItem.value.length !== 0 ? "کد اتباع باید 12 رقم باشد":"کد اتباع را وارد نمایید");
        //     }
        // }, 500)


        nationalIdItem.addEventListener("keyup", function (event) {
            if (event.target.value.length >= 12 && event.which !== 8) {
                event.preventDefault();
            }
            // const validationStatus = validateMobile(event.target.value);
            // console.log("event.target.value",validationStatus,event.target.value);
            if (nationalIdItem?.value && nationalIdItem.value.length === 12) {
                btn.removeAttribute("disabled");
                errorHolder.innerText = ("");

            } else {
                btn.setAttribute("disabled", true);
                errorHolder.innerText = ("کد اتباع باید 12 رقم باشد");

            }

        });

    });


}

/*####################################################################################################
#                                         Date Picker                                                 #
####################################################################################################*/

function reRenderDays(itemReference) {
    const pickerContainer = itemReference.parentElement;
    const currentDayValue = pickerContainer.querySelectorAll(".day").item(0).value;
    pickerContainer.querySelectorAll(".day").item(0).innerHTML = ("");
    const month = Number(pickerContainer.querySelectorAll(".month").item(0).value);

    const year = Number(pickerContainer.querySelectorAll(".year").item(0).value);

    let days = month <= 6 ? 31 : 30;

    function getDays(year, month) {
        return new Date(year, month, 0).getDate();
    }

    if (lang !== "fa") {
        days = getDays(year, month);
    }

    if (month === 12) {
        if (!isLeapYearJalali(year)) {
            days = 29;
        }
    }

    for (let i = 1; i <= days; i++) {
        pickerContainer.querySelectorAll(".day").item(0)
            .insertAdjacentHTML("beforeend", `<option value="${i}">${i}</option>`);
    }

    if (currentDayValue) {
        pickerContainer.querySelectorAll(".day").item(0).value = (currentDayValue);
    } else {
        setFinalDate(itemReference);
    }

}

function setFinalDate(itemReference) {
    const pickerContainer = itemReference.parentElement;
    const input = $(`#${pickerContainer.getAttribute("data-input")}`);
    let day = pickerContainer.querySelectorAll(".day").item(0).value;
    let month = pickerContainer.querySelectorAll(".month").item(0).value;
    let year = pickerContainer.querySelectorAll(".year").item(0).value;


    if (month && year && lang === "en" && year >= 1900) { // convert gergorian to jalali before sending data to server

        const jalali = gregorian_to_jalali(Number(year), Number(month), Number(day));
        year = jalali[0];
        month = jalali[1];
        day = jalali[2];
        input.value = (`${(year + "" + addZero(month, 2) + "" + addZero(day, 2))}`.replace("null", ""));

    } else if (month && year) {

        input.value = (`${(year + "" + addZero(month, 2) + "" + addZero(day, 2))}`.replace("null", ""));

    }

}


if ($(".custom-calendar")?.length > 0) {


    const endYear = lang === "fa" ? 1402 : 2023;
    const startYear = lang === "fa" ? 1290 : 1900;

    each(".custom-calendar", function (customCalendar) {

        const birthDateValue = customCalendar.querySelectorAll("input[name='birthDate']").item(0)?.value;

        const year = customCalendar.querySelectorAll(".year");
        const month = customCalendar.querySelectorAll(".month");
        const day = customCalendar.querySelectorAll(".day");

        for (let i = endYear; i >= startYear; i--) {
            // console.log("year", $(".custom-calendar .year"));
            year
                .item(0)
                .insertAdjacentHTML("beforeend", `<option value="${i}">${i}</option>`);

            if (birthDateValue && birthDateValue?.length === 8) {
                year.item(0).value = birthDateValue.substring(0, 4);
                // .change();
            }
        }

        for (let i = 1; i <= 12; i++) {
            // console.log("month", $(".custom-calendar .month"));
            month
                .item(0)
                .insertAdjacentHTML(
                    "beforeend",
                    `<option value="${i}">${months[i - 1]}</option>`
                );

            if (birthDateValue?.length === 8) {
                month.item(0).value = birthDateValue
                    .substring(4, 6)
                    .replace(/^0+/, "");
                // .cahcnge
            }
        }

        for (let i = 1; i <= 31; i++) {
            day
                .item(0)
                .insertAdjacentHTML("beforeend", `<option value="${i}">${i}</option>`);

            if (birthDateValue?.length === 8) {
                day.item(0).value = birthDateValue
                    .substring(6, 8)
                    .replace(/^0+/, "");
                // .change();
            }
        }


        year.item(0).addEventListener("change", function () {
            reRenderDays(this);
            setFinalDate(this);
        })

        month.item(0).addEventListener("change", function () {
            reRenderDays(this);
            setFinalDate(this);
        })


        day.item(0).addEventListener("change", function () {
            // reRenderDays(this);
            setFinalDate(this);
        })
    })


}


/*####################################################################################################
#                                         Tabs                                                 #
####################################################################################################*/

const tabsButtons = $(".tabs li");
const tabsContents = $(".tab-content > div");

for (let i = 0; i < tabsButtons.length; i++) {
    tabsButtons.item(i).addEventListener("click", function (event) {
        event.preventDefault();
        const targetId = this.getAttribute("data-target");

        for (let j = 0; j < tabsButtons.length; j++) {
            tabsButtons.item(j).className = "";
        }
        this.className = "active";

        for (let j = 0; j < tabsContents.length; j++) {
            tabsContents.item(j).className = "";
        }
        $("#" + targetId).className = "active";

        if (targetId === "loginQr") {
            initQrCode();
        } else if (targetId === "loginOtp") {
            clearTimer("getOtpIntervalQr");
        }
    })
}

/*####################################################################################################
#                                         QR Login                                                 #
####################################################################################################*/

const handleLoginWithOtp = (otpResponse) => {

    // const otpArray = otpResponse.otp.split("");
    //
    // $("#loginQr .userInput .first").item(0).value = otpArray[0];
    // $("#loginQr .userInput .second").item(0).value = otpArray[1];
    // $("#loginQr .userInput .third").item(0).value = otpArray[2];
    // $("#loginQr .userInput .fourth").item(0).value = otpArray[3];
    // $("#loginQr .userInput .fifth").item(0).value = otpArray[4];

    appendHtml(
        document.body,
        '<form id="qr-login-form-hidden" style="visibility: hidden;width:0;height:0;overflow: hidden" method="POST" action="/login_otp"> <input type="_hidden" name="username" value="' + otpResponse.userName + '"/> <input type="_hidden" name="password" value="' + otpResponse.otp + '"/>  <input type="hidden" name="' + csrf_parameterName + '"  value="' + csrf_token + '" header="' + csrf_headerName + '"/> </form>'
    );
    const sessionForm = $('#qr-login-form-hidden');
    sessionForm.submit();
};

function initQrCode() {

    clearTimer("getOtpIntervalQr");

    $(".errors-holder p").item(0).innerText = "";
    const API = `/client/v1/qrc/request`;
    const query = {deviceName: navigator.userAgent};
    const headers = {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: Basic
    };


    httpService(API, query, headers, function (xhttp) {
        const response = JSON.parse(xhttp?.response);
        $("#qr-code-image").setAttribute("src",
            !response.image.includes("data:") ? ('data:image/png;base64, ' + response.image) : response.image
        );
        $("#qr-code-key").value = response.qrCodeKey;
        startTimer();
        window.getOtpIntervalQr = setInterval(() => handleOtpCheckerForQrCode(), 5000);
        setTimeout(() => {
            clearTimer("getOtpIntervalQr");
        }, 120000);
    }, "POST", true, true, false)
}


function handleOtpCheckerForQrCode() {

    const otpHeaders = {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: Basic
    };

    const OTP_API = `/client/v1/qrc/otp`;

    httpService(
        OTP_API,
        {qrCodeKey: $("#qr-code-key").value},
        otpHeaders,
        function (xhttp) {
            if (xhttp.status === 200) {
                handleLoginWithOtp(JSON.parse(xhttp.response));
            }
        },
        "POST", true, true
    );
}


const otpRetry = $("#retry-otp");

if (otpRetry && otpRetry?.addEventListener) {
    otpRetry.addEventListener("click", function (event) {
        event.preventDefault();
        initQrCode();
    })
}


each(".close-modal", function (item) {
    item.addEventListener("click", function () {
        // console.log("close-modal");
        each(".modal", function (item) {
            item.style.display = "none";
        });
    })
});

// if($("#faqModal")){
//     each(".faq-icon",function(item){
//         item.addEventListener("click",function(event){
//             event.preventDefault();
//             $("#faqModal").style.display = "flex";
//         })
//     });
// }

if ($("#socialIcons")) {
    console.log("socialIcons Exist ....");
    each(".downloadApp", function (item) {
        item.addEventListener("click", function (event) {
            event.preventDefault();
            $("#socialIcons").style.display = "flex";
        })
    });

}


const sentOtpMail = $("#send-otp-email");

if (sentOtpMail ) {
    console.log(sentOtpMail)
    sentOtpMail.addEventListener("click", function (event) {
        event.preventDefault();

        const API = `/public/v1/user/ussd/get/otp/bymail`;
        // const query = { deviceName: navigator.userAgent };
        const headers = {
            'Content-Type': 'application/json',
            Authorization: Basic,
            // "Accept-Language": lang
        };

        const mobileSessionStorage = sessionStorage.getItem("mobile");
console.log('injaaa',headers)
        httpService(API + "?mobile=" + (mob || mobileSessionStorage), "", headers, function (xhr) {
            console.log(xhr)
            toast(xhr.response?.data?.result || languageProperties["messages.emailSent"], "success");
            // toast(errorMessageHandler(error));
        }, "GET", true, true);

    })

}


const resetMultiFactorAuth = $("#reset-multi-factor-auth");

if (resetMultiFactorAuth && resetMultiFactorAuth?.addEventListener) {

    resetMultiFactorAuth.addEventListener("click", function (event) {
        event.preventDefault();

        const API = `/resetUserMultiFactorAuth`;
        // const query = { deviceName: navigator.userAgent };
        const headers = {
            'Content-Type': 'application/json',
            Authorization: Basic,
            // "Accept-Language": lang
        };

        const mobileSessionStorage = sessionStorage.getItem("mobile");
        // httpService(API+"?mobile="+(mob||mobileSessionStorage),"",headers,function(xhr){
        httpService(API, "", headers, function (xhr) {
            toast(xhr.response?.data?.result || languageProperties["messages.emailSent"], "success");
            // toast(errorMessageHandler(error));
        }, "GET", true, true);

    })

}

const url = new URL(window.location.href);

if (url.searchParams.has('logout')) {
    window.seconds = 120;
    localStorage.removeItem("st");
    fadeOut(otpSubmit).then(function () {
        fadeIn(otpForm).then(() => {
        });
    })
}


const userType = localStorage.getItem("userType");

if ($(".errors-holder")?.length && userType === "foreigner") {
    each(".errors-holder", function (errorHolder) {
        const p = errorHolder?.querySelector("p")?.innerText;
        // console.log("p",p);
        if (p?.includes("کدملی")) {
            console.log("includes", true);
            // console.log("p2",p);
            if (errorHolder && errorHolder.querySelector("p")) {
                errorHolder.querySelector("p").innerText = p.replaceAll("کدملی", "کد اتباع");
            }
        }
    });
}


(function (window, document) {

    'use strict';

    // patch CustomEvent to allow constructor creation (IE/Chrome)
    if (typeof window.CustomEvent !== 'function') {

        window.CustomEvent = function (event, params) {

            params = params || {bubbles: false, cancelable: false, detail: undefined};

            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };

        window.CustomEvent.prototype = window.Event.prototype;
    }

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    let xDown = null;
    let yDown = null;
    let xDiff = null;
    let yDiff = null;
    let timeDown = null;
    let startEl = null;

    function handleTouchEnd(e) {

        // if the user released on a different target, cancel!
        if (startEl !== e.target) return;

        let swipeThreshold = parseInt(getNearestAttribute(startEl, 'data-swipe-threshold', '20'), 10); // default 20 units
        let swipeUnit = getNearestAttribute(startEl, 'data-swipe-unit', 'px'); // default px
        let swipeTimeout = parseInt(getNearestAttribute(startEl, 'data-swipe-timeout', '500'), 10);    // default 500ms
        let timeDiff = Date.now() - timeDown;
        let eventType = '';
        let changedTouches = e.changedTouches || e.touches || [];

        if (swipeUnit === 'vh') {
            swipeThreshold = Math.round((swipeThreshold / 100) * document.documentElement.clientHeight); // get percentage of viewport height in pixels
        }
        if (swipeUnit === 'vw') {
            swipeThreshold = Math.round((swipeThreshold / 100) * document.documentElement.clientWidth); // get percentage of viewport height in pixels
        }

        if (Math.abs(xDiff) > Math.abs(yDiff)) { // most significant
            if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
                if (xDiff > 0) {
                    eventType = 'swiped-left';
                } else {
                    eventType = 'swiped-right';
                }
            }
        } else if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
            if (yDiff > 0) {
                eventType = 'swiped-up';
            } else {
                eventType = 'swiped-down';
            }
        }

        if (eventType !== '') {

            let eventData = {
                dir: eventType.replace(/swiped-/, ''),
                touchType: (changedTouches[0] || {}).touchType || 'direct',
                xStart: parseInt(xDown, 10),
                xEnd: parseInt((changedTouches[0] || {}).clientX || -1, 10),
                yStart: parseInt(yDown, 10),
                yEnd: parseInt((changedTouches[0] || {}).clientY || -1, 10)
            };

            // fire `swiped` event event on the element that started the swipe
            startEl.dispatchEvent(new CustomEvent('swiped', {bubbles: true, cancelable: true, detail: eventData}));

            // fire `swiped-dir` event on the element that started the swipe
            startEl.dispatchEvent(new CustomEvent(eventType, {bubbles: true, cancelable: true, detail: eventData}));
        }

        // reset values
        xDown = null;
        yDown = null;
        timeDown = null;
    }

    function handleTouchStart(e) {

        // if the element has data-swipe-ignore="true" we stop listening for swipe events
        if (e.target.getAttribute('data-swipe-ignore') === 'true') return;

        startEl = e.target;

        timeDown = Date.now();
        xDown = e.touches[0].clientX;
        yDown = e.touches[0].clientY;
        xDiff = 0;
        yDiff = 0;
    }

    function handleTouchMove(e) {

        if (!xDown || !yDown) return;

        let xUp = e.touches[0].clientX;
        let yUp = e.touches[0].clientY;

        xDiff = xDown - xUp;
        yDiff = yDown - yUp;
    }

    function getNearestAttribute(el, attributeName, defaultValue) {

        // walk up the dom tree looking for attributeName
        while (el && el !== document.documentElement) {

            let attributeValue = el.getAttribute(attributeName);

            if (attributeValue) {
                return attributeValue;
            }

            el = el.parentNode;
        }

        return defaultValue;
    }

}(window, document));


if ($("#swipeDownloadApp")) {
    $("#swipeDownloadApp").addEventListener('swiped-up', function (e) {
        console.log(e.target); // element that was swiped
        console.log(e.detail); // see event data below

        $("#landing").className = "open";
    });


    $("#swipeDownloadAppClose").addEventListener('swiped-down', function (e) {
        console.log(e.target); // element that was swiped
        console.log(e.detail); // see event data below

        $("#landing").className = "";
    });

    $("#swipeDownloadAppClose").addEventListener('click', function (e) {
        $("#landing").className = "";
    });

    $("#swipeDownloadApp").addEventListener('click', function (e) {
        $("#landing").className = "open";
    });
}


function handleLanguage(event) {
    event.preventDefault();
    window.location.href = window.location.href.split('?')[0] + "?lang=" + (event.target.getAttribute("href").value.trim("#"));
}


if ($("#form2")) {

    each("#form2 .inputNumber", function (item) {

        item.addEventListener("keyup", function () {

            let empty = 0;

            each("#form2 .inputNumber", function (other) {

                if ((!other.value || !other.value.length) && other.id!=='passPortCode') {

                    empty++;

                }
            });

            if (empty > 3) {
                $("#register_btn2").setAttribute("disabled", "disabled");
            } else {
                $("#register_btn2").removeAttribute("disabled");
            }

        });

    });

}