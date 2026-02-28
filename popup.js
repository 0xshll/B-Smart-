function updateStatus() {
    chrome.storage.local.get(['bncData'], (res) => {
        if (res.bncData && res.bncData.headers) {
            const rid = res.bncData.requestId || "4934946125104529153";
            document.getElementById('displayId').innerText = rid;
            document.getElementById('runSniper').disabled = false;
        }
    });
}
setInterval(updateStatus, 1000);

document.getElementById('runSniper').onclick = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // الحصول على القيم من الخانات
    const startDelay = parseInt(document.getElementById('delayInput').value) * 1000;
    const totalSpins = parseInt(document.getElementById('spinsInput').value);

    chrome.storage.local.get(['bncData'], (res) => {
        const h = res.bncData.headers;
        const rid = res.bncData.requestId || "4934946125104529153";

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (headers, requestId, delay, spins) => {
                console.log(`⚡ [Sniper] Command Received. Waiting ${delay/1000} seconds...`);
                
                setTimeout(() => {
                    console.log("🚀 [Sniper] Execution Started!");
                    let successfulSpins = 0;
                    
                    const apiSniper = setInterval(() => {
                        const traceId = Math.random().toString(36).substring(2);
                        
                        fetch("https://www.binance.com/bapi/growth/v1/private/growth-paas/user/reward/draw", {
                            method: "POST",
                            headers: {
                                "bnc-uuid": headers['bnc-uuid'],
                                "csrftoken": headers.csrftoken,
                                "device-info": headers['device-info'],
                                "fvideo-id": headers['fvideo-id'],
                                "fvideo-token": headers['fvideo-token'],
                                "content-type": "application/json",
                                "clienttype": "web",
                                "x-trace-id": traceId
                            },
                            body: JSON.stringify({"id": requestId, "resourceId": 41210}),
                            credentials: "include"
                        })
                        .then(r => r.json())
                        .then(data => {
                            console.log("Server Response:", data);
                            if(data.success || data.code === "000000") {
                                successfulSpins++;
                                console.log(`🎉 Win! Attempt: ${successfulSpins} of ${spins}`);
                                if(successfulSpins >= spins) {
                                    console.log("✅ Target reached. Stopping...");
                                    clearInterval(apiSniper);
                                }
                            }
                        }).catch(e => console.error("Error:", e));
                    }, 500);

                    // حماية إضافية لإيقاف السكريبت بعد فترة معينة
                    setTimeout(() => clearInterval(apiSniper), 10000); 
                }, delay);
            },
            args: [h, rid, startDelay, totalSpins] // تمرير كل القيم الجديدة للسكريبت
        });
        alert(`Sniper set for ${totalSpins} spins in ${startDelay/1000}s!`);
    });
};