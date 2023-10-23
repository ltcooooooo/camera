const config = JSON.parse(localStorage.getItem("config")) || {}

//读取之前修改的配置，有的话使用之前调整过得配置
if (config.position) window.api.setPosition(config.position)
if (config.size) window.api.setSize(config.size)
if (!config.videoScale) config.videoScale = 1
if (!config.scaleStatus) {
    config.scaleStatus = "等比"
    window.api.setScale(config.scaleStatus)
}

//窗口位置发生变化后，将新位置保存
window.api.handlePositonChange((event, position) => {
    const [x, y] = position
    config.position = { x, y }
    localStorage.setItem("config", JSON.stringify(config))
})
//窗口尺寸发生变化后，将新尺寸保存
let resizeTimer = null
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
        const width = document.body.offsetWidth
        const height = document.body.offsetHeight
        config.size = { width, height }
        localStorage.setItem("config", JSON.stringify(config))
    }, 1000)
})

//DOM加载之后
window.addEventListener("DOMContentLoaded", async () => {
    const videoEl = document.querySelector("video")
    
    //点击镜像翻转
    const mirrorEl = document.querySelector(".mirror")
    if (config.videoScale) {
        videoEl.style.transform = `scaleX(${config.videoScale})`
        mirrorEl.style.transform = `scaleX(${config.videoScale})`
    }
    mirrorEl.addEventListener("click", function () {
        videoEl.style.transform = `scaleX(${config.videoScale *= -1})`
        mirrorEl.style.transform = `scaleX(${config.videoScale})`
        localStorage.setItem("config", JSON.stringify(config))
    })

    // 改变圆角
    const mainEl = document.querySelector("main")
    const roundBoxEl = document.querySelector(".icon.round .box")
    const roundRangeEl = document.querySelector(".icon.round input")
    if (config.round) {
        roundBoxEl.style.borderRadius = config.round + "%"
        mainEl.style.borderRadius = config.round + "vmin"
        roundRangeEl.value = config.round
    }
    roundRangeEl.addEventListener("input", function () {
        roundBoxEl.style.borderRadius = this.value + "%"
        mainEl.style.borderRadius = this.value + "vmin"
        config.round = this.value
        localStorage.setItem("config", JSON.stringify(config))
    })
    //点击切换窗口比例
    const scaleEl = document.querySelector("div.scale")
    const scaleText = scaleEl.querySelectorAll(".text span")
    scaleText[0].innerText = config.scaleStatus
    scaleText[1].innerText = config.scaleStatus === "等比" ? "1:1" : `${config.currentCameraScale[0]}:${config.currentCameraScale[1]}`
    scaleEl.addEventListener("click", () => {
        let scaleStatus;
        if (config.scaleStatus === "等比") {
            scaleStatus = scaleText[0].innerText = "原始"
            scaleText[1].innerText = `${config.currentCameraScale[0]}:${config.currentCameraScale[1]}`
            window.api.setScale(config.currentCameraScale)
        } else {
            scaleStatus = scaleText[0].innerText = "等比"
            scaleText[1].innerText = "1:1"
            window.api.setScale([1, 1])
        }
        config.scaleStatus = scaleStatus
        localStorage.setItem("config", JSON.stringify(config))
    })
    //切换视频录入设备事件
    videoEl.addEventListener("loadedmetadata", () => {
        const videoWidth = videoEl.videoWidth
        const videoHeight = videoEl.videoHeight
        const GCD = gcd(videoWidth, videoHeight)
        const scale = [videoWidth / GCD, videoHeight / GCD]
        videoWidth > videoHeight ? videoEl.style.height = '100%' : videoEl.style.width = '100%'
        config.currentCameraScale = scale
        localStorage.setItem("config", JSON.stringify(config))
        if (config.scaleStatus === "原始") {
            window.api.setScale(scale)
            scaleText[1].innerText = `${config.currentCameraScale[0]}:${config.currentCameraScale[1]}`
        }
    })
    //读取用户视频录入设备
    const enumerateDevices = await navigator.mediaDevices.enumerateDevices()
    const videoInputList = enumerateDevices.filter(item => item.kind === "videoinput")
    const cameraListEl = document.querySelector(".cameraList .box")
    let deviceId = videoInputList[0].deviceId
    const deviceIdIndex = videoInputList.findIndex(item => item.deviceId == config.deviceId)
    if (config.deviceId && deviceId !== -1) {
        deviceId = config.deviceId
    }
    changeVideoInput(deviceId, videoEl)
    //显示读取到的列表
    let videoIndex = 0
    for (const videoDevices of videoInputList) {
        const cameraInfo = document.createElement("div")
        cameraInfo.classList.add("cameraInfo")
        cameraInfo.innerText = videoDevices.label
        cameraInfo.setAttribute("deviceId", videoDevices.deviceId)
        if (deviceIdIndex !== -1) {
            if (videoIndex == deviceIdIndex) cameraInfo.classList.add("selected")
        } else {
            if (videoIndex == 0) cameraInfo.classList.add("selected")
        }
        videoIndex++
        cameraListEl.append(cameraInfo)
    }
    //点击切换摄像头
    const cameraInfoList = cameraListEl.querySelectorAll(".cameraInfo")
    if ([...cameraInfoList].length === 0) return cameraListEl.innerHTML = `<div class="cameraInfo none">无视频录入设备</div>`
    for (const cameraInfo of cameraInfoList) {
        cameraInfo.addEventListener("click", () => {
            for (const cameraUnselect of cameraInfoList) {
                cameraUnselect.classList.remove("selected")
            }
            cameraInfo.classList.add("selected")
            const deviceId = cameraInfo.getAttribute("deviceId")
            changeVideoInput(deviceId, videoEl)
            config.deviceId = deviceId
            localStorage.setItem("config", JSON.stringify(config))
        })
    }
})

//切换摄像头
async function changeVideoInput(deviceId, videoEl) {
    let constraints = {
        audio: false,
        video: { deviceId: deviceId }
    }
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    videoEl.srcObject = mediaStream
    videoEl.play()
}

//求最大公约数
function gcd(a, b) {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}
