/**
 * IronWall+ Gamethon — Screen Recorder Module
 * ============================================
 * Uses native HTML5 MediaRecorder to capture the screen and save as .webm
 */

(function () {
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;

    // We'll init the Recorder button if it exists
    document.addEventListener('DOMContentLoaded', () => {
        const recordBtn = document.getElementById('record-btn');
        if (!recordBtn) return; // No button on this page

        recordBtn.addEventListener('click', async () => {
            if (!isRecording) {
                await startRecording(recordBtn);
            } else {
                stopRecording(recordBtn);
            }
        });
    });

    async function startRecording(btn) {
        try {
            // Request the screen stream
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    frameRate: { ideal: 60 }
                }
            });

            // Initialize Recorder
            // Try to use a good codec
            const options = { mimeType: 'video/webm; codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                // Fallback
                options.mimeType = 'video/webm';
            }

            mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.ondataavailable = function (e) {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = function () {
                // When recording stops (either by user or by ending the screen share)
                saveVideo();
                resetButton(btn);
            };

            // Detect if the user clicks "Stop Sharing" on the browser ribbon
            stream.getVideoTracks()[0].onended = () => {
                if (isRecording) {
                    mediaRecorder.stop();
                }
            };

            mediaRecorder.start();
            isRecording = true;

            // Change UI
            btn.classList.add('recording');
            btn.innerHTML = '■ STOP REC';

        } catch (err) {
            console.error('Error starting screen recording:', err);
            // User likely cancelled the screen picker
        }
    }

    function stopRecording(btn) {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            // The onstop event will handle saving and resetting the UI
        }
    }

    function saveVideo() {
        if (recordedChunks.length === 0) return;

        const blob = new Blob(recordedChunks, {
            type: 'video/webm'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;

        // Format date for filename
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

        a.download = `IronWall_Demo_${dateStr}_${timeStr}.webm`;
        a.click();

        // HARDENING: Delay revocation to ensure the browser has handled the click/download request
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            if (a.parentNode) document.body.removeChild(a);
        }, 1000);

        // Clean up
        recordedChunks = [];
        isRecording = false;
    }

    function resetButton(btn) {
        btn.classList.remove('recording');
        btn.innerHTML = '⏺ REC';
        isRecording = false;
    }

})();
