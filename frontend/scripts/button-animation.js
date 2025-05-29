export function animateSendButtonLoading() {
    const image = document.getElementById('send-button-image');
    const btn = document.getElementById('send-button');

    const spinner = btn.querySelector('.btn-spinner');
    image.classList.add('hidden');
    
    btn.disabled = true;
    spinner.classList.remove('hidden');
}

export function sendButtonReturnToDefault() {
    var btn = document.getElementById('send-button');

    const spinner = btn.querySelector('.btn-spinner');
    spinner.classList.add('hidden');
    btn.disabled = false;

    const image = document.getElementById('send-button-image');
    image.classList.remove('hidden');
}
 