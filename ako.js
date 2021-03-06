let uploadBaseComponent = `
<div style="display: flex;flex-direction:column;" class="ft-ako-upload-form-button">
    <svg class="ft-ako-upload-form-button-icon" xmlns="http://www.w3.org/2000/svg" width="50" height="43" viewBox="0 0 50 43">
        <path
            d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z" />
    </svg>
    <input type="file" id="ft-ako-upload-form-file-input" data-multiple-caption="{count} files selected" multiple style="display:none" />
    <label for="file"><strong>Click to choose a file</strong><span class="box__dragndrop"></span>.</label>
</div>
`;
let uploadingComponent = `<div style="display: flex;flex-direction:column;" class="ft-ako-upload-form-button"><label for="file"><strong>{0}% uploaded</label></div>`;
let successComponent = `<div style="display: flex;flex-direction:column;" class="ft-ako-upload-form-button-success">
        <p>Upload succeeded. Please hand over the text bellow to your consultant to gain access to the report.</p>
        <p id="result-id">{0}</p>
    </div>`;
let failedComponent = `<div style="display: flex;flex-direction:column;" class="ft-ako-upload-form-button"><label for="file"><strong>An error occured while uploading. {0}</label><label><strong>Click to upload more files</strong></label></div>`;
let uploaded = false;


let modal = `
<div id="modal" class="modal">

  <div class="modal-content">
    <span class="close" id="close-button">&times;</span>
    <p>The upload has been finished. You can copy the bellow Identifier and transmit it to your consultant for further information on the validity.</p>
    <p id="upload-result"></p>
  </div>

</div>
`

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    resetOverlay(this);
});

function resetOverlay(self) {
    self.overlay = document.createElement("div");
    self.overlay.classList.add("ft-ako-upload-form-overlay")

    let overlayContent = document.createElement("div");
    overlayContent.innerHTML = uploadBaseComponent;
    overlayContent.classList.add("ft-ako-upload-form-overlay-content")
    overlayContent.addEventListener("click", function (e) {
        if (uploaded) {
            self.overlayContent.classList.remove("succeeded");
            self.overlayContent.classList.remove("failed");
            self.overlayContent.classList.remove("uploading");
            self.overlayContent.innerHTML = uploadBaseComponent;
            uploaded = false;
        }
        openFile(self.overlayContent);
    });
    self.overlayContent = overlayContent;
    self.overlay.appendChild(overlayContent)

    let div = document.createElement('div');
    div.innerHTML = modal;
    self.overlay.appendChild(div)


    self.overlay.addEventListener('drag', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    self.overlay.addEventListener('dragstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    self.overlay.addEventListener('dragend', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.overlayContent.style.display = "none";
    });

    self.overlay.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.overlayContent.style.display = "flex";
    });

    self.overlay.addEventListener('dragenter', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.overlayContent.style.display = "flex";
    });

    self.overlay.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.overlayContent.style.display = "none";
    });

    self.overlay.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length == 0) {
            self.overlayContent.style.display = "none";
            return;
        }
        uploadFile(self.overlayContent, droppedFiles[0]);
    });

    document.body.appendChild(self.overlay);

    document.getElementById("close-button").addEventListener('click', function () {
        document.getElementById("modal").style.display = "none"
    })

    window.onresize = (e) => setOverlay(self.overlay);

    setTimeout(function () { setOverlay(self.overlay); }, 200);
}

function openFile(overlayContent) {
    let input = document.getElementById("ft-ako-upload-form-file-input");
    if (input) {
        input.onchange = function (e) {
            if (this.files.length == 0) {
                return;
            }
            uploadFile(overlayContent, this.files[0]);
        };
        input.click();
    }
}

function setOverlay(overlay) {
    let akoDropArea = document.getElementById("ako");
    overlay.style.position = "absolute";
    overlay.style.width = akoDropArea.offsetWidth;
    overlay.style.height = akoDropArea.offsetHeight;
    overlay.style.left = akoDropArea.offsetLeft;
    overlay.style.top = akoDropArea.offsetTop;
}

function uploadFile(overlayContent, file) {
    overlayContent.style.display = "flex";

    var formData = new FormData();
    formData.append("file", file);

    var request = new XMLHttpRequest();
    request.open("POST", "https://ako-api.fiskaltrust.de/api/filedrop", true);

    let innerHTML = overlayContent.innerHTML;

    request.upload.addEventListener("progress", function (e) {
        if (e.lengthComputable) {
            var percentComplete = (e.loaded || e.position) / e.total;
            overlayContent.innerHTML = uploadingComponent.replace("{0}", percentComplete * 100);
            overlayContent.classList.add("uploading");
        }
    }, false);

    request.onload = function () {
        overlayContent.classList.remove("uploading");
        if (request.status >= 200 && request.status < 300) {
            document.getElementById("modal").style.display = "block"
            document.getElementById("upload-result").innerText = request.responseText
            overlayContent.innerHTML = innerHTML;
        } else {
            overlayContent.innerHTML = failedComponent.replace("{0}", request.responseText);
            overlayContent.classList.add("failed");
        }
        uploaded = true;
    };

    request.onerror = function () {
        overlayContent.classList.remove("uploading");
        setTimeout(function () {
            overlayContent.innerHTML = failedComponent.replace("{0}", request.responseText);
            overlayContent.classList.add("failed");
        }, 800);
        uploaded = true;
    };

    request.send(formData);
}
