async function initApp() {
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
        // Everything looks good!
        await initPlayer();
    } else {
        // This browser does not have the minimum set of APIs we need.
        console.error('Browser not supported!');
    }

    // Update the online status and add listeners so that we can visualize
    // our network state to the user.
    updateOnlineStatus();
    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}
const licenseServer = 'http://license.dev.trustdta.com:8080/drmproxy/v3/getLicense?contentId=34Z29nq6eW9j4eu&useDrmProxy=1'; // DASH License服务器地址


async function initPlayer() {
    // Create a Player instance.
    const video = document.getElementById('video');
    const player = new shaka.Player();

    const manifest2 = 'https://zbmgr.v.qq.com/newlive/thumbplayer_live.html?&noad=1&drm=128&type=vod&__env=miropeng_0&vid=h004146chft';
    // const licenseServer = 'http://license.dev.trustdta.com:8080/drmproxy/v3/getLicense?contentId=34Z29nq6eW9j4eu&useDrmProxy=1'; // DASH License服务器地址

    // 配置DRM
    player.configure({
        drm: {
            servers: {
                // 华为WisePlay的DRM系统标识
                'com.wiseplay.drm': licenseServer
            }
        }
    });

    // Attach player and storage to the window to make it easy to access
    // in the JS console and so we can access it in other methods.
    await player.attach(video);
    window.player = player;

    // Listen for error events.
    player.addEventListener('error', onErrorEvent);

    initStorage(player);

    const downloadButton = document.getElementById('download-button');
    downloadButton.onclick = onDownloadClick;

    // Update the content list to show what items we initially have
    // stored offline.
    refreshContentList();
}

function onErrorEvent(event) {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail);
}

function onError(error) {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
}

function selectTracks(tracks) {
    // This example stores the highest bandwidth variant.
    //
    // Note that this is just an example of an arbitrary algorithm, and not a best
    // practice for storing content offline.  Decide what your app needs, or keep
    // the default (user-pref-matching audio, best SD video, all text).
    const found = tracks
        .filter(function(track) { return track.type == 'variant'; })
        .sort(function(a, b) { return a.bandwidth - b.bandwidth; })
        .pop();
    console.log('Offline Track bandwidth: ' + found.bandwidth);
    return [ found ];
}

function initStorage(player) {
    // Create a storage instance and configure it with optional
    // callbacks. Set the progress callback so that we visualize
    // download progress and override the track selection callback.
    window.storage = new shaka.offline.Storage(player);
    // 配置离线存储参数
    window.storage.configure({
        offline: {
            progressCallback: setDownloadProgress,
            trackSelectionCallback: selectTracks,
        },
        drm: {
            servers: {
                // 华为WisePlay的DRM系统标识
                'com.wiseplay.drm': licenseServer
            }
        }
    });
}

function listContent() {
    return window.storage.list();
}

function playContent(content) {
    // 恢复DRM配置
    window.player.configure({
        drm: {
            offline: {
                'com.widevine.alpha': { usePersistentLicense: true }
            }
        }
    });

    window.player.load(content.offlineUri);
}


function removeContent(content) {
    return window.storage.remove(content.offlineUri);
}

 function downloadContent(manifestUri, title) {
    const metadata = {
        'title': title,
        'downloaded': new Date()
    };
// return      player.load(manifestUri).promise;
    return window.storage.store(manifestUri, metadata).promise;
}

/*
 * UI callback for when the download button is clicked. This will
 * disable the button while the download is in progress, start the
 * download, and refresh the content list once the download is
 * complete.
 */
function onDownloadClick() {
    const downloadButton = document.getElementById('download-button');
    const manifestUri = document.getElementById('asset-uri-input').value;
    const title = document.getElementById('asset-title-input').value;

    if (!manifestUri) {
        alert('请输入有效的内容地址');
        return;
    }

    downloadButton.disabled = true;
    setDownloadProgress(null, 0);

    // Download the content and then re-enable the download button so
    // that more content can be downloaded.
    downloadContent(manifestUri, title)
        .then(function() {
            return refreshContentList();
        })
        .then(function(content) {
            setDownloadProgress(null, 1);
            downloadButton.disabled = false;
        })
        .catch(function(error) {
            // In the case of an error, re-enable the download button so
            // that the user can try to download another item.
            downloadButton.disabled = false;
            onError(error);
        });
}

/*
 * Update the online status box at the top of the page to tell the
 * user whether or not they have an internet connection.
 */
function updateOnlineStatus() {
    const signal = document.getElementById('online-signal');
    if (navigator.onLine) {
        signal.innerHTML = 'ONLINE';
        signal.style.background = 'green';
    } else {
        signal.innerHTML = 'OFFLINE';
        signal.style.background = 'grey';
    }
}

/*
 * Find our progress bar and set the value to show the progress we
 * have made.
 */
function setDownloadProgress(content, progress) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.value = progress * progressBar.max;
}

/*
 * Clear our content table and repopulate it table with the current
 * list of downloaded content.
 */
function refreshContentList() {
    const contentTable = document.getElementById('content-table');

    // Clear old rows from the table.
    while (contentTable.rows.length) {
        contentTable.deleteRow(0);
    }

    const addRow = function(content) {
        const append = -1;

        const row = contentTable.insertRow(append);
        row.insertCell(append).innerHTML = content.offlineUri;
        Object.keys(content.appMetadata)
            .map(function(key) {
                return content.appMetadata[key];
            })
            .forEach(function(value) {
                row.insertCell(append).innerHTML = value;
            });

        row.insertCell(append).appendChild(createButton(
            'PLAY',
            function() { playContent(content); }));

        row.insertCell(append).appendChild(createButton(
            'REMOVE',
            function() {
                removeContent(content)
                    .then(function() { refreshContentList() });
            }));
    };

    return listContent()
        .then(function(content) { content.forEach(addRow); });
};

/*
 * Create a new button but do not add it to the DOM. The caller
 * will need to do that.
 */
function createButton(text, action) {
    const button = document.createElement('button');
    button.innerHTML = text;
    button.onclick = action;
    return button;
}

document.addEventListener('DOMContentLoaded', initApp);